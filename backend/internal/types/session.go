package types

import (
	"context"
	"errors"
	"sync"
	"time"
)

type Session struct {
	Code        string
	Owner       *User
	Users       map[string]*User
	Timer       *Timer
	Chat        []*Message
	mu          sync.RWMutex
	subscribers map[string]chan Event
}

type Message struct {
	UserID string
	Name   string
	Text   string
}

type Event struct {
	Type string
	Data interface{}
}

func NewSession(owner *User) *Session {
	return &Session{
		Code:        "", // assigned by Store.Add
		Owner:       owner,
		Users:       map[string]*User{owner.UserID.String(): owner},
		Chat:        make([]*Message, 0, 50),
		subscribers: make(map[string]chan Event),
	}
}

func (s *Session) AddUser(u *User) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.Users[u.UserID.String()] = u
}

func (s *Session) RemoveUser(userID string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.Users, userID)
}

func (s *Session) AddMessage(msg *Message) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if len(s.Chat) >= 50 {
		s.Chat = s.Chat[1:]
	}
	s.Chat = append(s.Chat, msg)
}

// Subscribe creates a buffered channel for a user to receive events.
func (s *Session) Subscribe(userID string) chan Event {
	ch := make(chan Event, 32)
	s.mu.Lock()
	s.subscribers[userID] = ch
	s.mu.Unlock()
	return ch
}

// Unsubscribe removes a user's channel. Safe to call on a missing key.
func (s *Session) Unsubscribe(userID string) {
	s.mu.Lock()
	delete(s.subscribers, userID)
	s.mu.Unlock()
}

func (s *Session) Publish(e Event) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, ch := range s.subscribers {
		select {
		case ch <- e:
		default:
		}
	}
}

func (s *Session) IsOwner(userID string) bool {
	return s.Owner.UserID.String() == userID
}

func (s *Session) Close() {
	s.mu.Lock()
	if s.Timer != nil {
		s.Timer.cancel()
	}
	s.mu.Unlock()

	s.Publish(Event{Type: "session_closed", Data: nil})
}

// ── Timer methods ──────────────────────────────────────────────────

func (s *Session) SetTimer(seconds int) {
	s.mu.Lock()
	if s.Timer != nil {
		s.Timer.cancel()
	}
	s.Timer = NewTimer(seconds)
	s.mu.Unlock()

	s.Publish(Event{
		Type: "timer_set",
		Data: map[string]interface{}{"seconds": seconds, "state": "idle"},
	})
}

func (s *Session) StartTimer() error {
	s.mu.Lock()

	if s.Timer == nil {
		s.mu.Unlock()
		return errors.New("timer not set")
	}
	if s.Timer.State == "running" {
		s.mu.Unlock()
		return errors.New("timer already running")
	}
	if s.Timer.State == "done" {
		s.mu.Unlock()
		return errors.New("timer is done — reset first")
	}

	ctx, cancel := context.WithCancel(context.Background())
	s.Timer.ctx = ctx
	s.Timer.cancel = cancel
	s.Timer.State = "running"
	t := s.Timer
	s.mu.Unlock()

	go func() {
		ticker := time.NewTicker(time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				s.mu.Lock()
				t.Remaining -= time.Second
				remaining := int(t.Remaining.Seconds())
				done := t.Remaining <= 0
				if done {
					t.State = "done"
				}
				s.mu.Unlock()

				if done {
					s.Publish(Event{Type: "timer_done", Data: map[string]interface{}{"remaining": 0, "state": "done"}})
					return
				}
				s.Publish(Event{Type: "timer_tick", Data: map[string]interface{}{"remaining": remaining, "state": "running"}})

			case <-ctx.Done():
				return
			}
		}
	}()

	return nil
}

func (s *Session) PauseTimer() error {
	s.mu.Lock()

	if s.Timer == nil {
		s.mu.Unlock()
		return errors.New("timer not set")
	}
	if s.Timer.State != "running" {
		s.mu.Unlock()
		return errors.New("timer is not running")
	}

	s.Timer.State = "paused"
	s.Timer.cancel()
	remaining := int(s.Timer.Remaining.Seconds())
	s.mu.Unlock()

	s.Publish(Event{Type: "timer_state", Data: map[string]interface{}{"remaining": remaining, "state": "paused"}})
	return nil
}

func (s *Session) ResetTimer() error {
	s.mu.Lock()

	if s.Timer == nil {
		s.mu.Unlock()
		return errors.New("timer not set")
	}

	s.Timer.cancel()
	s.Timer.Remaining = s.Timer.Duration
	s.Timer.State = "idle"
	remaining := int(s.Timer.Remaining.Seconds())
	s.mu.Unlock()

	s.Publish(Event{Type: "timer_state", Data: map[string]interface{}{"remaining": remaining, "state": "idle"}})
	return nil
}

// Snapshot returns the current session state for a newly-connected client.
func (s *Session) Snapshot() Event {
	s.mu.RLock()
	defer s.mu.RUnlock()

	timerData := map[string]interface{}{"remaining": 0, "state": "idle"}
	if s.Timer != nil {
		timerData["remaining"] = int(s.Timer.Remaining.Seconds())
		timerData["state"] = s.Timer.State
	}

	users := make([]map[string]string, 0, len(s.Users))
	for _, u := range s.Users {
		users = append(users, map[string]string{
			"user_id": u.UserID.String(),
			"name":    u.Name,
		})
	}

	chatCopy := make([]*Message, len(s.Chat))
	copy(chatCopy, s.Chat)

	return Event{
		Type: "session_snapshot",
		Data: map[string]interface{}{
			"timer":      timerData,
			"chat":       chatCopy,
			"users":      users,
			"owner_name": s.Owner.Name,
			"owner_id":   s.Owner.UserID.String(),
		},
	}
}
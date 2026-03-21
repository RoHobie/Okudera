package types

import (
	"math/rand"
	"sync"
	"time"
)

type Session struct {
	Code      string
	Owner     *User
	Users     map[string]*User
	Timer     *Timer
	Perms     bool
	mu        sync.RWMutex
	Broadcast chan Event
	Chat      []*Message
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

const codeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

func generateCode() string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
    b := make([]byte, 6)
    for i := range b {
        b[i] = codeChars[r.Intn(len(codeChars))]
    }
    return string(b)
}

func NewSession(owner *User) *Session {
    return &Session{
        Code:      generateCode(),
        Owner:     owner,
        Users:     map[string]*User{owner.UserID.String(): owner},
        Timer:     &Timer{State: "idle"},
        Perms:     false,
        Chat:      make([]*Message, 0, 50),
        Broadcast: make(chan Event, 32), 
		subscribers: make(map[string]chan Event),
    }
}

func (s *Session) AddUser(u *User) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.Users[u.UserID.String()] = u
}

func (s *Session) AddMessage(msg *Message) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if len(s.Chat) >= 50 {
		s.Chat = s.Chat[1:]
	}
	s.Chat = append(s.Chat, msg)
}
 
func (s *Session) Subscribe(userID string) chan Event {
	ch := make(chan Event, 32)
	s.mu.Lock()
	s.subscribers[userID] = ch
	s.mu.Unlock()
	return ch
}

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
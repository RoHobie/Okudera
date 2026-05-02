package types

import (
	"math/rand"
	"sync"
)

const codeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func generateCode() string {
	b := make([]byte, 6)
	for i := range b {
		b[i] = codeChars[rand.Intn(len(codeChars))]
	}
	return string(b)
}

type Store struct {
	sessions map[string]*Session
	mu       sync.RWMutex
}

func NewStore() *Store {
	return &Store{sessions: make(map[string]*Session)}
}

func (s *Store) Get(code string) (*Session, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	sess, ok := s.sessions[code]
	return sess, ok
}

func (s *Store) Add(sess *Session) string {
	s.mu.Lock()
	defer s.mu.Unlock()
	for {
		code := generateCode()
		if _, exists := s.sessions[code]; !exists {
			sess.Code = code
			s.sessions[code] = sess
			return code
		}
	}
}

func (s *Store) Delete(code string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.sessions, code)
}
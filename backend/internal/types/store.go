package types

import "sync"

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

func (s *Store) Add(sess *Session) {
	s.mu.Lock() 
	defer s.mu.Unlock()
	s.sessions[sess.Code] = sess
}

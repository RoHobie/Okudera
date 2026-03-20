package types

import "sync"

type Session struct {
	Code      string
	Owner     *User
	Users     map[string]*User
	Timer     *Timer
	Perms     bool
	mu        sync.RWMutex
	Broadcast chan Event
	Chat      []*Message
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

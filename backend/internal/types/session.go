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
    }
}
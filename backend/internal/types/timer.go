package types

import "time"

type Timer struct {
	State     string
	Duration  time.Duration
	Remaining time.Duration
	stop      chan struct{}
}

func NewTimer(seconds int) *Timer {
	d := time.Duration(seconds) * time.Second
	return &Timer{
		State:     "idle",
		Duration:  d,
		Remaining: d,
		stop:      make(chan struct{}),
	}
}

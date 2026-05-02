package types

import (
	"context"
	"time"
)

type Timer struct {
	State     string
	Duration  time.Duration
	Remaining time.Duration
	cancel    context.CancelFunc // idempotent — safe to call multiple times
	ctx       context.Context
}

func NewTimer(seconds int) *Timer {
	d := time.Duration(seconds) * time.Second
	ctx, cancel := context.WithCancel(context.Background())
	return &Timer{
		State:     "idle",
		Duration:  d,
		Remaining: d,
		ctx:       ctx,
		cancel:    cancel,
	}
}
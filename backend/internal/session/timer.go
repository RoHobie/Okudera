package session

import "time"

type Timer struct {
	State string
	Duration time.Duration
	Remaining time.Duration
}
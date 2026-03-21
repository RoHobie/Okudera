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

func (t *Timer) Start(publish func(Event)) {
	if t.State == "running" {
		return
	}
	t.State = "running"
	t.stop = make(chan struct{})

	go func() {
		ticker := time.NewTicker(time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				t.Remaining -= time.Second
				publish(Event{
					Type: "timer_tick",
					Data: map[string]interface{}{
						"remaining": int(t.Remaining.Seconds()),
						"state":     t.State,
					},
				})
				if t.Remaining <= 0 {
					t.State = "done"
					publish(Event{
						Type: "timer_done",
						Data: map[string]interface{}{"state": "done"},
					})
					return
				}

			case <-t.stop:
				return
			}
		}
	}()
}

func (t *Timer) Pause(publish func(Event)) {
	if t.State != "running" {
		return
	}
	t.State = "paused"
	close(t.stop)
	publish(Event{
		Type: "timer_state",
		Data: map[string]interface{}{
			"remaining": int(t.Remaining.Seconds()),
			"state":     "paused",
		},
	})
}

func (t *Timer) Reset(publish func(Event)) {
	if t.State == "running" {
		close(t.stop)
	}
	t.State = "idle"
	t.Remaining = t.Duration
	publish(Event{
		Type: "timer_state",
		Data: map[string]interface{}{
			"remaining": int(t.Remaining.Seconds()),
			"state":     "idle",
		},
	})
}
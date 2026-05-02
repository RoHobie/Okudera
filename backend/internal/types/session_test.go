package types_test

import (
	"testing"
	"time"

	"github.com/RoHobie/Okudera/backend/internal/types"
	"github.com/google/uuid"
)

func newTestSession() *types.Session {
	owner := &types.User{UserID: uuid.New(), Name: "owner"}
	sess := types.NewSession(owner)
	sess.Code = "TEST01"
	return sess
}

func TestTimerStateMachine(t *testing.T) {
	tests := []struct {
		name    string
		actions func(sess *types.Session) error
		wantErr bool
	}{
		{
			name: "start without setting timer returns error",
			actions: func(sess *types.Session) error {
				return sess.StartTimer()
			},
			wantErr: true,
		},
		{
			name: "idle -> running",
			actions: func(sess *types.Session) error {
				sess.SetTimer(10)
				return sess.StartTimer()
			},
			wantErr: false,
		},
		{
			name: "running -> pause -> running",
			actions: func(sess *types.Session) error {
				sess.SetTimer(10)
				if err := sess.StartTimer(); err != nil {
					return err
				}
				if err := sess.PauseTimer(); err != nil {
					return err
				}
				return sess.StartTimer()
			},
			wantErr: false,
		},
		{
			name: "double pause returns error",
			actions: func(sess *types.Session) error {
				sess.SetTimer(10)
				sess.StartTimer()
				sess.PauseTimer()
				return sess.PauseTimer() // should error: not running
			},
			wantErr: true,
		},
		{
			name: "reset from paused state — no panic",
			actions: func(sess *types.Session) error {
				sess.SetTimer(10)
				sess.StartTimer()
				sess.PauseTimer()
				return sess.ResetTimer()
			},
			wantErr: false,
		},
		{
			name: "reset from running state — no panic",
			actions: func(sess *types.Session) error {
				sess.SetTimer(10)
				sess.StartTimer()
				return sess.ResetTimer()
			},
			wantErr: false,
		},
		{
			name: "set timer while running replaces cleanly — no panic",
			actions: func(sess *types.Session) error {
				sess.SetTimer(10)
				sess.StartTimer()
				sess.SetTimer(30) // replaces running timer
				return nil
			},
			wantErr: false,
		},
		{
			name: "start after reset works",
			actions: func(sess *types.Session) error {
				sess.SetTimer(10)
				sess.StartTimer()
				sess.ResetTimer()
				return sess.StartTimer()
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			sess := newTestSession()
			err := tt.actions(sess)
			if (err != nil) != tt.wantErr {
				t.Errorf("got err=%v, wantErr=%v", err, tt.wantErr)
			}
			// Allow any goroutines to settle before the next test.
			time.Sleep(10 * time.Millisecond)
		})
	}
}

func TestTimerTicksAndCompletes(t *testing.T) {
	sess := newTestSession()
	// Subscribe before starting so we catch events.
	ch := sess.Subscribe("watcher")
	defer sess.Unsubscribe("watcher")

	sess.SetTimer(2)
	if err := sess.StartTimer(); err != nil {
		t.Fatalf("StartTimer: %v", err)
	}

	var gotDone bool
	timeout := time.After(4 * time.Second)
	for !gotDone {
		select {
		case ev := <-ch:
			if ev.Type == "timer_done" {
				gotDone = true
			}
		case <-timeout:
			t.Fatal("timed out waiting for timer_done event")
		}
	}
}

func TestStoreCodeCollisionSafety(t *testing.T) {
	store := types.NewStore()
	codes := make(map[string]bool)
	for i := 0; i < 100; i++ {
		owner := &types.User{UserID: uuid.New(), Name: "u"}
		sess := types.NewSession(owner)
		code := store.Add(sess)
		if codes[code] {
			t.Fatalf("duplicate code generated: %s", code)
		}
		codes[code] = true
	}
}
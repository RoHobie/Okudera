package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/RoHobie/Okudera/backend/internal/types"
)

type SetTimerRequest struct {
	Seconds int    `json:"seconds"`
	UserID  string `json:"user_id"`
}

type TimerActionRequest struct {
	UserID string `json:"user_id"`
}

func SetTimerHandler(store *types.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		code := extractCode(r.URL.Path) // /api/v1/sessions/{code}/timer
		sess, ok := store.Get(code)
		if !ok {
			http.Error(w, "session not found", http.StatusNotFound)
			return
		}

		var req SetTimerRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Seconds <= 0 {
			http.Error(w, "invalid request, seconds required", http.StatusBadRequest)
			return
		}

		if !isOwnerOrAllowed(sess, req.UserID) {
			http.Error(w, "not allowed", http.StatusForbidden)
			return
		}

		sess.Timer = types.NewTimer(req.Seconds)
		sess.Publish(types.Event{
			Type: "timer_state",
			Data: map[string]interface{}{
				"remaining": req.Seconds,
				"state":     "idle",
			},
		})

		w.WriteHeader(http.StatusOK)
	}
}

func TimerActionHandler(store *types.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(r.URL.Path, "/")
		if len(parts) < 7 {
			http.Error(w, "invalid path", http.StatusBadRequest)
			return
		}
		code := parts[4]
		action := parts[6] // start | pause | reset

		sess, ok := store.Get(code)
		if !ok {
			http.Error(w, "session not found", http.StatusNotFound)
			return
		}

		var req TimerActionRequest
		json.NewDecoder(r.Body).Decode(&req)

		if !isOwnerOrAllowed(sess, req.UserID) {
			http.Error(w, "not allowed", http.StatusForbidden)
			return
		}

		if sess.Timer == nil {
			http.Error(w, "timer not set", http.StatusBadRequest)
			return
		}

		switch action {
		case "start":
			sess.Timer.Start(sess.Publish)
		case "pause":
			sess.Timer.Pause(sess.Publish)
		case "reset":
			sess.Timer.Reset(sess.Publish)
		default:
			http.Error(w, "unknown action", http.StatusBadRequest)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

// helpers
func extractCode(path string) string {
	parts := strings.Split(path, "/")
	if len(parts) >= 5 {
		return parts[4]
	}
	return ""
}

func isOwnerOrAllowed(sess *types.Session, userID string) bool {
	if sess.Owner.UserID.String() == userID {
		return true
	}
	return sess.Perms // if perms = true, anyone can control timer
}
package handler

import (
	"encoding/json"
	"net/http"

	"github.com/RoHobie/Okudera/backend/internal/types"
	"github.com/go-chi/chi/v5"
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
		code := chi.URLParam(r, "code")

		sess, ok := store.Get(code)
		if !ok {
			http.Error(w, "session not found", http.StatusNotFound)
			return
		}

		var req SetTimerRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Seconds <= 0 {
			http.Error(w, "seconds required", http.StatusBadRequest)
			return
		}

		// Only the owner can set the timer
		if !sess.IsOwner(req.UserID) {
			http.Error(w, "only the room owner can control the timer", http.StatusForbidden)
			return
		}

		sess.SetTimer(req.Seconds)
		w.WriteHeader(http.StatusOK)
	}
}

func TimerActionHandler(store *types.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		code := chi.URLParam(r, "code")
		action := chi.URLParam(r, "action")

		sess, ok := store.Get(code)
		if !ok {
			http.Error(w, "session not found", http.StatusNotFound)
			return
		}

		var req TimerActionRequest
		json.NewDecoder(r.Body).Decode(&req)

		// Only the owner can start/pause/reset
		if !sess.IsOwner(req.UserID) {
			http.Error(w, "only the room owner can control the timer", http.StatusForbidden)
			return
		}

		var err error
		switch action {
		case "start":
			err = sess.StartTimer()
		case "pause":
			err = sess.PauseTimer()
		case "reset":
			err = sess.ResetTimer()
		default:
			http.Error(w, "unknown action", http.StatusBadRequest)
			return
		}

		if err != nil {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/RoHobie/Okudera/backend/internal/types"
	"github.com/go-chi/chi/v5"
)

type SendMessageRequest struct {
	UserID string `json:"user_id"`
	Name   string `json:"name"`
	Text   string `json:"text"`
}

func SendMessageHandler(store *types.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		code := chi.URLParam(r, "code")

		sess, ok := store.Get(code)
		if !ok {
			http.Error(w, "session not found", http.StatusNotFound)
			return
		}

		var req SendMessageRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.Text) == "" {
			http.Error(w, "text is required", http.StatusBadRequest)
			return
		}

		if len(req.Text) > 500 {
			http.Error(w, "message too long", http.StatusBadRequest)
			return
		}

		msg := &types.Message{UserID: req.UserID, Name: req.Name, Text: req.Text}
		sess.AddMessage(msg)

		sess.Publish(types.Event{
			Type: "chat_message",
			Data: map[string]string{
				"user_id": req.UserID,
				"name":    req.Name,
				"text":    req.Text,
			},
		})

		w.WriteHeader(http.StatusOK)
	}
}

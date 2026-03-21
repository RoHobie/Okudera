package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/RoHobie/Okudera/backend/internal/types"
)

type SendMessageRequest struct {
	UserID string `json:"user_id"`
	Name string `json:"name"`
	Text string `json:"text"`
}

func SendMessageHandler(store *types.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(r.URL.Path, "/")
		if len(parts) < 6 {
			http.Error(w, "invalid path", http.StatusBadRequest)
			return
		}
		
		code := parts[4]

		sess, ok := store.Get(code)

		if !ok {
			http.Error(w, "session not found", http.StatusNotFound)
			return
		}

		var req SendMessageRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid request", http.StatusBadRequest)
			return
		}

		if strings.TrimSpace(req.Text) == "" {
			http.Error(w, "text is required", http.StatusBadRequest)
			return 
		}

		msg := &types.Message{
			UserID: req.UserID,
			Name: req.Name,
			Text: req.Text,
		}

		sess.AddMessage(msg);

		sess.Publish(types.Event{
			Type: "chat_message",
			Data: map[string]string{
				"user_id": req.UserID,
				"name": req.Name,
				"text": req.Text,
			},
		})

		w.WriteHeader(http.StatusOK)
	}
}
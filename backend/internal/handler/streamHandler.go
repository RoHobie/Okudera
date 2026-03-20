package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/RoHobie/Okudera/backend/internal/types"
)

func StreamHandler(store *types.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		flusher, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "streaming not supported", http.StatusInternalServerError)
			return
		}

		code := r.URL.Query().Get("code")
		userID := r.URL.Query().Get("user_id")

		sess, ok := store.Get(code)
		if !ok {
			http.Error(w, "session not found", http.StatusNotFound)
			return
		}

		// each client gets their own channel
		ch := sess.Subscribe(userID)
		defer sess.Unsubscribe(userID)

		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")

		for {
			select {
			case event := <-ch:
				data, err := json.Marshal(event)
				if err != nil {
					continue
				}
				fmt.Fprintf(w, "data: %s\n\n", data)
				flusher.Flush()

			case <-r.Context().Done():
				return
			}
		}
	}
}
package handler

import (
    "encoding/json"
    "fmt"
    "net/http"

    "github.com/RoHobie/Okudera/backend/internal/types"
)

func StreamHandler(store *types.Store) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {

        // Make sure the client supports streaming
        flusher, ok := w.(http.Flusher)
        if !ok {
            http.Error(w, "streaming not supported", http.StatusInternalServerError)
            return
        }

        code := r.URL.Query().Get("code")
        sess, ok := store.Get(code)
        if !ok {
            http.Error(w, "session not found", http.StatusNotFound)
            return
        }

        // Set SSE headers
        w.Header().Set("Content-Type", "text/event-stream")
        w.Header().Set("Cache-Control", "no-cache")
        w.Header().Set("Connection", "keep-alive")

        // 4. Listen for events until client disconnects
        for {
            select {
            case event := <-sess.Broadcast:
                data, err := json.Marshal(event)
                if err != nil {
                    continue
                }
                fmt.Fprintf(w, "data: %s\n\n", data)
                flusher.Flush()

            case <-r.Context().Done():
                // client disconnected (closed tab, network drop, etc.)
                return
            }
        }
    }
}
package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/RoHobie/Okudera/backend/internal/types"
)

type CreateSessionRequest struct {
	Name string `json:"name"`
}

type CreateSessionResponse struct {
	Code    string `json:"code"`
	UserID  string `json:"user_id"`
}

type JoinSessionRequest struct {
	Name   string `json:"name"`
	UserID string `json:"user_id"`
}

type JoinSessionResponse struct {
	Code   string `json:"code"`
	UserID string `json:"user_id"`
}

func CreateSessionHandler(store *types.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req CreateSessionRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.Name) == "" {
			http.Error(w, "invalid request, name is required", http.StatusBadRequest)
			return
		}

		owner := &types.User{
			UserID: uuid.New(),
			Name:   req.Name,
		}
		sess := types.NewSession(owner)
		store.Add(sess)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(CreateSessionResponse{
			Code:   sess.Code,
			UserID: owner.UserID.String(),
		})
	}
}

func JoinSessionHandler(store *types.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(r.URL.Path, "/")
		if len(parts) < 6 {
			http.Error(w, "invalid path", http.StatusBadRequest)
			return
		}
		code := parts[4]				// not changing url structure anytime soon

		sess, ok := store.Get(code)
		if !ok {
			http.Error(w, "session not found", http.StatusNotFound)
			return
		}

		var req JoinSessionRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.Name) == "" {
			http.Error(w, "invalid request, name is required", http.StatusBadRequest)
			return
		}

		user := &types.User{
			UserID: uuid.New(),
			Name:   req.Name,
		}

		sess.AddUser(user)

		// broadcast to existing members
		sess.Broadcast <- types.Event{
			Type: "user_joined",
			Data: map[string]string{"name": user.Name, "user_id": user.UserID.String()},
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(JoinSessionResponse{
			Code:   code,
			UserID: user.UserID.String(),
		})
	}
}
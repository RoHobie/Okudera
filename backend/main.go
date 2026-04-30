package main

import (
	"log"
	"net/http"
	"time"

	"github.com/RoHobie/Okudera/backend/internal/handler"
	"github.com/RoHobie/Okudera/backend/internal/types"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/httprate"
)

func main() {
	store := types.NewStore()

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(httprate.LimitByIP(60, time.Minute)) 

	r.Route("/api/v1", func(r chi.Router) {
		r.With(httprate.LimitByIP(10, time.Minute)).
			Post("/sessions", handler.CreateSessionHandler(store))

		r.Post("/sessions/{code}/join", handler.JoinSessionHandler(store))
		r.Post("/sessions/{code}/leave", handler.LeaveSessionHandler(store))
		r.Get("/stream", handler.StreamHandler(store))

		r.Post("/sessions/{code}/timer", handler.SetTimerHandler(store))
		r.Post("/sessions/{code}/timer/{action}", handler.TimerActionHandler(store))

		r.With(httprate.LimitByIP(30, time.Minute)).
			Post("/sessions/{code}/messages", handler.SendMessageHandler(store))
	})

	// serve frontend
	r.Handle("/*", http.FileServer(http.Dir("../frontend/dist")))

	log.Println("server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
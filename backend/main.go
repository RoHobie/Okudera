package main

import (
	"log"
	"net/http"

	"github.com/RoHobie/Okudera/backend/internal/handler"
	"github.com/RoHobie/Okudera/backend/internal/types"
)

func main() {
	store := types.NewStore()

	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/sessions", handler.CreateSessionHandler(store))
	mux.HandleFunc("/api/v1/sessions/", handler.JoinSessionHandler(store))
	mux.HandleFunc("/api/v1/stream", handler.StreamHandler(store))

	// serve frontend
	mux.Handle("/", http.FileServer(http.Dir("../client")))

	log.Println("server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
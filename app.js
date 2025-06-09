// Import GSAP library
import gsap from "gsap"

// API Configuration
const API_URL = "https://shazam-core.p.rapidapi.com/v1/charts/country"
const API_KEY = "73ec588339msh0aad14b831a7fb2p1fb80cjsnf7918996415b"
const API_HOST = "shazam-core.p.rapidapi.com"
const COUNTRY_CODE = "IN" // India

// DOM Elements
const chartsContainer = document.getElementById("charts-container")
const loadingIndicator = document.querySelector(".loading-indicator")
const playButton = document.getElementById("play-button")
const currentTrackImg = document.getElementById("current-track-img")
const currentTrackName = document.getElementById("current-track-name")
const currentArtistName = document.getElementById("current-artist-name")

// State
let isPlaying = false
let currentTrack = null
let tracks = []

// Fetch music data from Shazam API
async function fetchMusicData() {
  try {
    const response = await fetch(`${API_URL}?country_code=${COUNTRY_CODE}`, {
      method: "GET",
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": API_HOST,
      },
    })

    if (!response.ok) {
      throw new Error("Network response was not ok")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching music data:", error)
    return []
  }
}

// Render charts to the DOM
function renderCharts(charts) {
  chartsContainer.innerHTML = ""

  charts.forEach((track, index) => {
    const chartItem = document.createElement("div")
    chartItem.className = "chart-item"
    chartItem.dataset.index = index

    // Get the image URL or use a placeholder
    const imageUrl = track.images?.coverart || "/placeholder.svg?height=200&width=200"

    chartItem.innerHTML = `
            <div class="chart-img-container">
                <img src="${imageUrl}" alt="${track.title}" class="chart-img">
            </div>
            <div class="chart-info">
                <div class="chart-title">${track.title || "Unknown Title"}</div>
                <div class="chart-artist">${track.subtitle || "Unknown Artist"}</div>
            </div>
        `

    // Add click event to play the track
    chartItem.addEventListener("click", () => {
      playTrack(index)
    })

    chartsContainer.appendChild(chartItem)

    // Animate the chart item with GSAP
    gsap.fromTo(chartItem, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay: index * 0.05 })
  })
}

// Play a track
function playTrack(index) {
  const track = tracks[index]

  if (!track) return

  currentTrack = track
  isPlaying = true

  // Update the player UI
  currentTrackImg.src = track.images?.coverart || "/placeholder.svg?height=60&width=60"
  currentTrackName.textContent = track.title || "Unknown Title"
  currentArtistName.textContent = track.subtitle || "Unknown Artist"

  // Update play button icon
  playButton.innerHTML = '<i class="fas fa-pause"></i>'

  // Animate the now playing bar with GSAP
  gsap.fromTo(
    ".now-playing-bar",
    { boxShadow: "0 0 0 rgba(0,0,0,0)" },
    { boxShadow: "0 -5px 15px rgba(0,0,0,0.1)", duration: 0.5 },
  )

  // Animate the progress bar
  gsap.to(".progress", { width: "100%", duration: 30, ease: "linear" })

  // Highlight the selected track
  document.querySelectorAll(".chart-item").forEach((item) => {
    item.style.backgroundColor = "#f9f9f9"
    if (Number.parseInt(item.dataset.index) === index) {
      item.style.backgroundColor = "#f0f0f0"
    }
  })
}

// Toggle play/pause
playButton.addEventListener("click", () => {
  if (!currentTrack) return

  isPlaying = !isPlaying

  if (isPlaying) {
    playButton.innerHTML = '<i class="fas fa-pause"></i>'
    gsap.to(".progress", { width: "100%", duration: 30, ease: "linear" })
  } else {
    playButton.innerHTML = '<i class="fas fa-play"></i>'
    gsap.killTweensOf(".progress")
  }
})

// Initialize the app
async function initApp() {
  // Show loading indicator
  loadingIndicator.style.display = "flex"

  // Fetch music data
  tracks = await fetchMusicData()

  // Hide loading indicator
  loadingIndicator.style.display = "none"

  if (tracks.length > 0) {
    // Render charts
    renderCharts(tracks)

    // Initialize animations
    initAnimations()
  } else {
    // Show error message if no tracks
    chartsContainer.innerHTML = `
            <div class="error-message">
                <p>Unable to load music data. Please try again later.</p>
            </div>
        `
  }
}

// Initialize GSAP animations
function initAnimations() {
  // Animate sidebar items
  gsap.from("nav ul li", {
    opacity: 0,
    x: -20,
    stagger: 0.1,
    duration: 0.5,
    ease: "power2.out",
  })

  // Animate header
  gsap.from("header", {
    opacity: 0,
    y: -20,
    duration: 0.5,
    ease: "power2.out",
  })

  // Animate content heading
  gsap.from("h1", {
    opacity: 0,
    y: 20,
    duration: 0.5,
    delay: 0.2,
    ease: "power2.out",
  })
}

// Start the app
document.addEventListener("DOMContentLoaded", initApp)

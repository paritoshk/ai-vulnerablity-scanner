'use client'
import { useEffect, useRef } from 'react'

interface EntropyProps {
    className?: string
    size?: number
    fullscreen?: boolean
}

export function Entropy({ className = "", size = 400, fullscreen = false }: EntropyProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Basic setup
        const updateSize = () => {
            const dpr = window.devicePixelRatio || 1
            let width, height;

            if (fullscreen) {
                width = window.innerWidth;
                height = window.innerHeight;
            } else {
                width = size;
                height = size;
            }

            canvas.width = width * dpr
            canvas.height = height * dpr
            canvas.style.width = `${width}px`
            canvas.style.height = `${height}px`
            ctx.scale(dpr, dpr)

            return { width, height }
        }

        let { width: canvasWidth, height: canvasHeight } = updateSize()

        // Use white particles as per user code
        const particleColor = '#ffffff'

        class Particle {
            x: number
            y: number
            size: number
            order: boolean
            velocity: { x: number; y: number }
            originalX: number
            originalY: number
            influence: number
            neighbors: Particle[]

            constructor(x: number, y: number, order: boolean) {
                this.x = x
                this.y = y
                this.originalX = x
                this.originalY = y
                this.size = 2
                this.order = order
                this.velocity = {
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 2
                }
                this.influence = 0
                this.neighbors = []
            }

            update(width: number, height: number) {
                if (this.order) {
                    // Ordered particles affected by chaos
                    const dx = this.originalX - this.x
                    const dy = this.originalY - this.y

                    // Calculate influence from chaos particles
                    const chaosInfluence = { x: 0, y: 0 }
                    this.neighbors.forEach(neighbor => {
                        if (!neighbor.order) {
                            const distance = Math.hypot(this.x - neighbor.x, this.y - neighbor.y)
                            const strength = Math.max(0, 1 - distance / 100)
                            chaosInfluence.x += (neighbor.velocity.x * strength)
                            chaosInfluence.y += (neighbor.velocity.y * strength)
                            this.influence = Math.max(this.influence, strength)
                        }
                    })

                    // Mix ordered motion and chaos influence
                    this.x += dx * 0.05 * (1 - this.influence) + chaosInfluence.x * this.influence
                    this.y += dy * 0.05 * (1 - this.influence) + chaosInfluence.y * this.influence

                    // Decay influence
                    this.influence *= 0.99
                } else {
                    // Chaos motion
                    this.velocity.x += (Math.random() - 0.5) * 0.5
                    this.velocity.y += (Math.random() - 0.5) * 0.5
                    this.velocity.x *= 0.95
                    this.velocity.y *= 0.95
                    this.x += this.velocity.x
                    this.y += this.velocity.y

                    // Boundary check
                    if (this.x < 0 || this.x > width) this.velocity.x *= -1
                    if (this.y < 0 || this.y > height) this.velocity.y *= -1
                    this.x = Math.max(0, Math.min(width, this.x))
                    this.y = Math.max(0, Math.min(height, this.y))
                }
            }

            draw(ctx: CanvasRenderingContext2D) {
                const alpha = this.order ?
                    0.8 - this.influence * 0.5 :
                    0.8
                ctx.fillStyle = `${particleColor}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx.fill()
            }
        }

        // Create particle grid
        let particles: Particle[] = []

        const initParticles = () => {
            particles = []
            const gridSize = 25 // Keep grid size constant or scale? User code used 25.
            // If fullscreen, we might want more particles? 
            // User code: spacing = size / gridSize. 
            // If fullscreen, size is width or height?
            // I'll use the larger dimension for spacing calculation to maintain density?
            // Or just stick to 25x25 grid stretched? 
            // User code: x = spacing * i + spacing / 2.
            // It creates a square grid. 
            // For fullscreen, I should probably fill the screen.
            // I'll stick to the user's logic but adapt for aspect ratio if needed, 
            // or just center the square grid in the screen?
            // "Entropy" usually implies order vs chaos. The split is at size/2.
            // I'll make it cover the screen.

            const spacingX = canvasWidth / gridSize
            const spacingY = canvasHeight / gridSize

            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    const x = spacingX * i + spacingX / 2
                    const y = spacingY * j + spacingY / 2
                    const order = x < canvasWidth / 2
                    particles.push(new Particle(x, y, order))
                }
            }
        }

        initParticles()

        // Update neighbors
        function updateNeighbors() {
            particles.forEach(particle => {
                particle.neighbors = particles.filter(other => {
                    if (other === particle) return false
                    const distance = Math.hypot(particle.x - other.x, particle.y - other.y)
                    return distance < 100
                })
            })
        }

        let time = 0
        let animationId: number

        function animate() {
            if (!ctx) return
            ctx.clearRect(0, 0, canvasWidth, canvasHeight)

            // Update neighbors occasionally
            if (time % 30 === 0) {
                updateNeighbors()
            }

            // Update and draw all particles
            particles.forEach(particle => {
                particle.update(canvasWidth, canvasHeight)
                particle.draw(ctx)

                // Draw connections
                particle.neighbors.forEach(neighbor => {
                    const distance = Math.hypot(particle.x - neighbor.x, particle.y - neighbor.y)
                    if (distance < 50) {
                        const alpha = 0.2 * (1 - distance / 50)
                        ctx.strokeStyle = `${particleColor}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
                        ctx.beginPath()
                        ctx.moveTo(particle.x, particle.y)
                        ctx.lineTo(neighbor.x, neighbor.y)
                        ctx.stroke()
                    }
                })
            })

            // Add separator line
            ctx.strokeStyle = `${particleColor}4D`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(canvasWidth / 2, 0)
            ctx.lineTo(canvasWidth / 2, canvasHeight)
            ctx.stroke()

            time++
            animationId = requestAnimationFrame(animate)
        }

        animate()

        const handleResize = () => {
            if (fullscreen) {
                const dims = updateSize()
                canvasWidth = dims.width
                canvasHeight = dims.height
                initParticles()
            }
        }

        window.addEventListener('resize', handleResize)

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId)
            }
            window.removeEventListener('resize', handleResize)
        }
    }, [size, fullscreen])

    return (
        <div className={`relative bg-black ${className}`} style={fullscreen ? { position: 'fixed', inset: 0, width: '100%', height: '100%' } : { width: size, height: size }}>
            <canvas
                ref={canvasRef}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
        </div>
    )
}

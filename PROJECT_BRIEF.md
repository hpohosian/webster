# Photo Editor Product Brief

## Core Mission

Build a graphic design and photo editing service that helps non-designers create polished, shareable visuals. The product should balance wide creative functionality with simple, approachable workflows.

The editor should help users:

- Create attention-grabbing photos and graphics.
- Process, optimize, and resize images for social networks.
- Learn design skills naturally through the editor experience.
- Move from idea to finished asset without needing prior design expertise.

## Allowed Stack

- HTML
- CSS
- TypeScript
- React
- NestJS
- Database of choice
- Swagger
- Docker

## Product Direction

Start from the existing prototype and evolve it carefully. Prioritize patterns, state architecture, and modularity early so the app does not need a full rewrite once real editor behavior is added.

The product should include recognizable branding:

- Creative logo
- Clear slogan/tagline
- Consistent visual identity

## Architecture Expectations

Use a layered architecture:

- User interface layer
- Business/domain layer
- Data layer

The architecture should support development speed, scalability, performance, availability, and clear ownership boundaries. UI components should not directly own core editor behavior when that behavior belongs in reusable business logic or services.

## UX/UI Process

Use the following product process as a standing guide:

1. User persona
2. Frustrations and pain points
3. Competitor analysis
4. Strategy: goals, challenges, solutions
5. Features and functionality
6. User flows
7. Wireframes
8. Moodboards
9. UI design
10. Testing with users

## Feature Priorities

The editor should grow toward:

- Image upload and canvas creation
- Resize and social media presets
- Adjustments and filters
- Text editing
- Drawing and fill tools
- Shapes
- Templates
- Layers
- History and undo/redo
- Export and optimization for social sharing

## Live Presentation Scenario

The finished project will be shown in a live presentation. The app must be ready to demonstrate the following end-to-end scenario.

### Deployment And Hosting

- Show Docker deployment configuration for hosting:
  - `Dockerfile`
  - `docker-compose.yml`
  - How services are built
  - How services are started
- It is acceptable to demonstrate project build logs.
- Show that the app works on hosting through a real domain name.
- Explain which database was selected and why it fits the product.

### Account Flow

- Open the app home page.
- Navigate to registration.
- Register a new user.
- Confirm account creation through an email link.
- Log in as that user.
- Modify user profile information.

### Editor Flow

- Show project templates.
- Create a new project.
- Add and edit text:
  - Color
  - Size
  - One additional text property
- Use freehand drawing tools, such as a pencil.
- Add shape elements, such as triangles, rectangles, arrows, and similar objects.
- Add other images as elements inside a project.
- Move elements on the canvas with both mouse and keyboard.
- Delete elements from the canvas.
- Show change history and restore a previous project version.
- Resize the canvas.
- Use canvas zoom.
- Save/export the project in multiple formats:
  - JPG
  - PNG
  - PDF
  - One additional format
- Share the project on social networks.
- Create a user template:
  - A project created by the user can be saved for later reuse as a base for other projects.
  - When creating a new project, the user can select that saved template as the base.
  - Treat this conceptually like branching a new feature branch from `main` and working from it.

## UX Principles

- Keep workflows simple, even when functionality is broad.
- Make controls discoverable and predictable.
- Let beginners succeed quickly.
- Avoid hiding essential editing controls behind unclear interactions.
- Prefer reusable patterns over one-off UI decisions.
- Test assumptions with real users and adjust based on feedback.

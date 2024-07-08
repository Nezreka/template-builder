# template-builder
 # 🏗️ Template Builder

## 🌟 Overview

Template Builder is a sophisticated, user-friendly web application designed to streamline the process of creating and managing website templates. Built with Next.js, TypeScript, and Prisma, this tool empowers developers and designers to construct modular, reusable website sections with ease.

![Template Builder Demo](https://via.placeholder.com/800x400.png?text=Template+Builder+Demo)

## ✨ Features

- 🧩 **Modular Section Building**: Drag-and-drop interface for assembling website templates from pre-defined sections.
- 🎨 **Custom Templates**: Create, edit, and manage custom templates for various website components.
- 💾 **Database Integration**: Utilizes Prisma with SQLite for efficient data management and persistence.
- 🔍 **Template Preview**: Real-time preview of assembled templates.
- 🔄 **API Routes**: API endpoints for template CRUD operations.
- 🎭 **Luxurious UI**: Elegant, responsive design with a focus on user experience.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/template-builder.git
   ```

2. Navigate to the project directory:
   ```
   cd template-builder
   ```

3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

4. Set up the database:
   ```
   npx prisma migrate dev
   ```

5. Start the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🛠️ Usage

1. **Creating a New Template**:
   - Click on "Add New Template" in the main interface.
   - Drag desired sections from the sidebar into the build area.
   - Click on each section to select a specific template for that section.
   - Arrange sections as needed using the up/down arrows.
   - Save your template when finished.

2. **Editing Existing Templates**:
   - Click on "Edit Template" to view all existing templates.
   - Select a template to modify its sections or content.
   - Make your changes and save the updated template.

3. **Managing Sections**:
   - Use the sidebar to view available section types.
   - Drag sections into the build area to add them to your template.
   - Remove sections by clicking the delete (X) button.

## 🧰 Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Database**: SQLite with Prisma ORM
- **API**: Next.js API Routes
- **Drag and Drop**: react-dnd

🔄 API

REST-like API: Implements a set of HTTP endpoints following many REST principles for template CRUD operations.
Intuitive Endpoints: Utilizes standard HTTP methods (GET, POST, PUT, DELETE) for resource manipulation.
Query Parameters: Supports filtering templates by section type.

Key Endpoints:

GET /api/templates: Retrieve all templates
POST /api/templates: Create a new template
GET /api/templates/[id]: Retrieve a specific template
PUT /api/templates/[id]: Update a specific template
DELETE /api/templates/[id]: Delete a specific template
GET /api/templates/by-section?type=[sectionType]: Retrieve templates by section type

These endpoints provide a clean, intuitive interface for interacting with template data, following common REST conventions while maintaining simplicity and ease of use.

## 📁 Project Structure

```
template-builder/
├── app/
│   ├── api/
│   │   └── templates/
│   │       └── route.ts
│   ├── components/
│   │   ├── BuildArea.tsx
│   │   ├── Sidebar.tsx
│   │   └── TemplateModal.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── prisma/
│   └── schema.prisma
├── public/
├── styles/
├── .env
├── next.config.js
├── package.json
└── tsconfig.json
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [react-dnd](https://react-dnd.github.io/react-dnd/)

---

Built with ❤️ by Broque

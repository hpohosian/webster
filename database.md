# Detailed Database Structure for the Online Photo Editor and Logo Creator

The most important tables are listed first. These tables form the core of the entire application.

---

# Core Tables

## 1. users

The main table for storing user accounts.

### Purpose

Stores account information, roles, avatars, and email confirmation status.

### Fields

* id
* login
* password_hash
* full_name
* email
* profile_picture_url
* rating
* role
* is_email_confirmed
* last_login_at
* created_at
* updated_at

---

## 2. projects

The main table for storing user projects.

### Purpose

Stores all user-created designs such as photos, logos, banners, posters, stories, and other graphic projects.

### Fields

* id
* user_id
* title
* description
* type
* thumbnail_url
* width
* height
* background_color
* is_public
* is_template_based
* current_version_id
* created_at
* updated_at
* last_opened_at

---

## 3. project_versions

Project snapshots and version history.

### Purpose

Stores autosave states, version history, and rollback points.

### Fields

* id
* project_id
* version_number
* snapshot_data
* preview_url
* created_by
* created_at

### Note

The snapshot_data field should be stored as JSONB in PostgreSQL.

---

## 4. layers

Project layers.

### Purpose

Allows storing and managing multiple layers inside a project.

### Fields

* id
* project_id
* name
* order_index
* is_visible
* is_locked
* opacity
* blend_mode
* parent_layer_group_id
* created_at
* updated_at

---

## 5. canvas_elements

One of the most important tables.

### Purpose

Stores all elements placed on the canvas.

### Example Elements

* text
* shape
* image
* line
* icon
* sticker
* brush stroke
* logo element

### Fields

* id
* project_id
* layer_id
* type
* name
* position_x
* position_y
* width
* height
* rotation
* opacity
* z_index
* is_locked
* is_hidden
* styles_json
* content_json
* created_at
* updated_at

### Note

styles_json may contain:

* colors
* borders
* shadows
* font styles
* blur
* gradients

content_json may contain:

* text content
* SVG data
* image URLs
* brush points
* shape type

---

## 6. uploaded_files

User uploaded files.

### Purpose

Stores uploaded images, SVG files, avatars, logos, and other assets.

### Fields

* id
* user_id
* project_id
* original_name
* file_name
* file_url
* thumbnail_url
* file_type
* mime_type
* file_size
* width
* height
* duration
* created_at

---

## 7. user_settings

User preferences and editor settings.

### Purpose

Stores personal preferences for the editor and interface.

### Fields

* id
* user_id
* theme
* language
* autosave_enabled
* grid_enabled
* snap_to_grid
* default_export_format
* default_canvas_width
* default_canvas_height
* created_at
* updated_at

---

# Authentication Tables

## 8. password_resets

### Purpose

Stores password reset requests.

### Fields

* id
* user_id
* token_hash
* expires_at
* used
* created_at

---

## 9. email_verifications

### Purpose

Stores email verification codes and tokens.

### Fields

* id
* user_id
* code
* expires_at
* created_at
* confirmed_at

---

# Layer and Editor Tables

## 10. layer_groups

### Purpose

Allows grouping multiple layers together.

### Fields

* id
* project_id
* name
* order_index
* is_collapsed
* created_at

---

## 11. brush_presets

### Purpose

Stores custom brush settings created by the user.

### Fields

* id
* user_id
* name
* color
* size
* opacity
* hardness
* spacing
* blend_mode
* created_at

---

## 12. filter_presets

### Purpose

Stores reusable filter presets.

### Fields

* id
* user_id
* name
* settings_json
* created_at

---

## 13. color_palettes

### Purpose

Stores reusable color palettes.

### Fields

* id
* user_id
* name
* colors_json
* created_at

---

# Templates and Design Assets

## 14. templates

### Purpose

Stores ready-to-use templates.

### Fields

* id
* title
* description
* type
* preview_url
* template_data
* category_id
* created_by
* is_public
* is_premium
* created_at
* updated_at

---

## 15. template_categories

### Purpose

Stores template categories.

### Fields

* id
* name
* slug
* icon

---

## 16. stickers

### Purpose

Stores stickers and decorative assets.

### Fields

* id
* name
* category_id
* preview_url
* image_url
* svg_data
* is_premium
* created_at

---

## 17. sticker_categories

### Fields

* id
* name
* slug

---

## 18. icons

### Purpose

Stores SVG icons for logo creation and design.

### Fields

* id
* name
* category_id
* svg_data
* preview_url
* tags
* created_at

---

## 19. icon_categories

### Fields

* id
* name
* slug

---

## 20. fonts

### Purpose

Stores available fonts.

### Fields

* id
* name
* family
* font_url
* preview_url
* is_premium
* created_at

---

## 21. user_favorite_fonts

### Purpose

Stores favorite fonts selected by users.

### Fields

* id
* user_id
* font_id
* created_at

---

## 22. brand_kits

### Purpose

Stores saved brand kits for logo creation.

### Fields

* id
* user_id
* name
* primary_color
* secondary_color
* accent_color
* font_primary_id
* font_secondary_id
* logo_url
* created_at
* updated_at

---

# Collaboration and Communication

## 23. project_collaborators

### Purpose

Allows multiple users to collaborate on one project.

### Fields

* id
* project_id
* user_id
* permission
* invited_by
* invited_at
* accepted_at

---

## 24. comments

### Purpose

Stores comments on projects or canvas elements.

### Fields

* id
* project_id
* user_id
* canvas_element_id
* content
* created_at

---

## 25. notifications

### Purpose

Stores in-app notifications.

### Fields

* id
* user_id
* type
* title
* message
* is_read
* created_at

---

# AI and Export Features

## 26. ai_generations

### Purpose

Stores AI-generated operations and results.

### Fields

* id
* user_id
* project_id
* type
* prompt
* input_file_url
* result_file_url
* status
* created_at

---

## 27. export_history

### Purpose

Stores export history.

### Fields

* id
* user_id
* project_id
* format
* width
* height
* quality
* exported_at

---

## 28. activity_logs

### Purpose

Stores user activity history.

### Fields

* id
* user_id
* project_id
* action_type
* entity_type
* entity_id
* metadata_json
* created_at

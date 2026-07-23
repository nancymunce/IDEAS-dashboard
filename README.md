# Nancy Munce IDEAS dashboard

A personal GitHub Pages dashboard for organizing frequently used work resources.

## Publish with GitHub Pages

1. Create a new GitHub repository, such as `nancy-command-center`.
2. Upload **the contents of this folder** to the repository root:
   - `index.html`
   - `assets/`
   - `data/`
   - `README.md`
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/(root)**
5. Click **Save**.
6. GitHub will provide the public website address after deployment.

## Adding and editing resources

Use **+ Add Resource** on the website.

Important: GitHub Pages is static. Additions and edits are stored in your current browser using local storage.

To make changes permanent and available on every device:

1. Click **Manage data** at the bottom of the dashboard.
2. Click **Export Updated Resources**.
3. GitHub will download a new `resources.json` file.
4. Replace `data/resources.json` in the repository with that exported file.
5. Commit the change.

GitHub Pages will automatically republish the dashboard.

## Privacy note

Anyone with access to the published GitHub Pages URL may be able to see the resource names, descriptions, and links. Do not include passwords, access tokens, student information, or confidential details.

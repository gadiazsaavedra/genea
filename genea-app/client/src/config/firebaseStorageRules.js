// Reglas de seguridad para Firebase Storage
// Estas reglas se deben copiar en la consola de Firebase Storage

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir acceso público a las imágenes de perfil
    match /profilePhotos/{userId}/{allImages=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Permitir acceso a fotos solo a usuarios autenticados y miembros de la familia
    match /photos/{familyId}/{allPhotos=**} {
      allow read: if request.auth != null && (
        // El usuario es miembro de la familia o administrador
        exists(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid)) ||
        exists(/databases/$(database)/documents/families/$(familyId)/admins/$(request.auth.uid))
      );
      allow write: if request.auth != null && (
        // Solo los administradores pueden subir fotos
        exists(/databases/$(database)/documents/families/$(familyId)/admins/$(request.auth.uid))
      );
    }
    
    // Permitir acceso a documentos solo a usuarios autenticados y miembros de la familia
    match /documents/{familyId}/{allDocs=**} {
      allow read: if request.auth != null && (
        exists(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid)) ||
        exists(/databases/$(database)/documents/families/$(familyId)/admins/$(request.auth.uid))
      );
      allow write: if request.auth != null && (
        exists(/databases/$(database)/documents/families/$(familyId)/admins/$(request.auth.uid))
      );
    }
    
    // Regla por defecto: denegar todo lo demás
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
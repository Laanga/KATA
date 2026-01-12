'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useMediaStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { Download, Upload, Trash2, LogOut, Camera, User, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const items = useMediaStore((state) => state.items);
  const setItems = useMediaStore((state) => state.setItems);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Cargar datos del usuario
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUsername(user.user_metadata?.username || user.email?.split('@')[0] || 'Usuario');
        setEmail(user.email || '');
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      }
    };
    
    if (isOpen) {
      loadUser();
    }
  }, [isOpen, supabase.auth]);

  // Subir avatar a Supabase Storage
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 2MB');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Eliminar avatar anterior si existe
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`avatars/${oldPath}`]);
        }
      }

      // Subir nuevo avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Guardar URL en user_metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Foto de perfil actualizada');
      
      // Recargar para actualizar en todos lados
      window.location.reload();
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Error al subir la imagen');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Eliminar avatar
  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;

    setIsUploadingAvatar(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Eliminar de storage
      const fileName = avatarUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('avatars').remove([`avatars/${fileName}`]);
      }

      // Eliminar de user_metadata
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });

      if (error) throw error;

      setAvatarUrl(null);
      toast.success('Foto de perfil eliminada');
      window.location.reload();
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast.error('Error al eliminar la imagen');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `kata-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Library exported successfully');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          setItems(data);
          toast.success(`Imported ${data.length} items`);
          onClose();
        } else {
          toast.error('Invalid file format');
        }
      } catch (error) {
        toast.error('Failed to import file');
      }
    };
    reader.readAsText(file);
  };

  const handleClearLibrary = () => {
    setItems([]);
    setShowClearConfirm(false);
    toast.success('Library cleared');
    onClose();
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) {
      toast.error('El nombre de usuario no puede estar vacío');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { username: username.trim() }
      });

      if (error) throw error;

      toast.success('Nombre actualizado correctamente');
      setIsEditingUsername(false);
      
      // Recargar la página para actualizar el nombre en todos lados
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating username:', error);
      toast.error('Error al actualizar el nombre');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Sesión cerrada');
      // Usar window.location para forzar una navegación completa y limpiar el estado
      window.location.href = '/landing';
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="md">
      <div className="space-y-6">
        {/* User Info Section */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
            Perfil
          </h3>
          <div className="space-y-4">
            {/* Avatar */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                Foto de Perfil
              </label>
              <div className="flex items-center gap-4">
                {/* Avatar preview */}
                <div className="relative group">
                  <div className="h-20 w-20 rounded-full overflow-hidden bg-gradient-to-br from-[var(--accent-primary)] to-emerald-900 border-2 border-white/10 flex items-center justify-center">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={32} className="text-white/70" />
                    )}
                  </div>
                  
                  {/* Overlay con botón de cámara */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 size={24} className="text-white animate-spin" />
                    ) : (
                      <Camera size={24} className="text-white" />
                    )}
                  </button>
                </div>

                {/* Botones */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="text-sm text-[var(--accent-primary)] hover:underline disabled:opacity-50"
                  >
                    {isUploadingAvatar ? 'Subiendo...' : 'Cambiar foto'}
                  </button>
                  {avatarUrl && (
                    <button
                      onClick={handleRemoveAvatar}
                      disabled={isUploadingAvatar}
                      className="text-sm text-red-400 hover:underline disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                {/* Input oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                JPG, PNG o GIF. Máximo 2MB.
              </p>
            </div>

            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                Nombre de Usuario
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!isEditingUsername || isSaving}
                  className={`flex-1 rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 text-sm text-white placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] ${
                    !isEditingUsername ? 'opacity-70' : ''
                  }`}
                  placeholder="Tu nombre"
                />
                {!isEditingUsername ? (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setIsEditingUsername(true)}
                  >
                    Editar
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => {
                        setIsEditingUsername(false);
                        // Recargar el nombre original
                        supabase.auth.getUser().then(({ data: { user } }) => {
                          if (user) {
                            setUsername(user.user_metadata?.username || user.email?.split('@')[0] || 'Usuario');
                          }
                        });
                      }}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSaveUsername}
                      isLoading={isSaving}
                    >
                      Guardar
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 text-sm text-white opacity-70"
              />
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                El email no se puede modificar
              </p>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
            Data Management
          </h3>
          <div className="space-y-3">
            {/* Export */}
            <button
              onClick={handleExport}
              className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-4 text-left transition-colors hover:bg-[var(--bg-tertiary)]/80"
            >
              <Download size={20} className="text-[var(--accent-primary)]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Export Library</p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Download your data as JSON ({items.length} items)
                </p>
              </div>
            </button>

            {/* Import */}
            <label className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-4 transition-colors hover:bg-[var(--bg-tertiary)]/80">
              <Upload size={20} className="text-[var(--accent-primary)]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Import Library</p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Restore from a previous export
                </p>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            {/* Clear Library */}
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex w-full items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-left transition-colors hover:bg-red-500/10"
              >
                <Trash2 size={20} className="text-red-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-400">Clear Library</p>
                  <p className="text-xs text-red-400/70">
                    Remove all items from your library
                  </p>
                </div>
              </button>
            ) : (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <p className="mb-3 text-sm text-red-400">
                  Are you sure? This will permanently delete all {items.length} items.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleClearLibrary}
                  >
                    Yes, Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* App Info */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
            About
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Version</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Total Items</span>
              <span className="text-white">{items.length}</span>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
            Cuenta
          </h3>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-left transition-colors hover:bg-red-500/10"
          >
            <LogOut size={20} className="text-red-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Cerrar Sesión</p>
              <p className="text-xs text-red-400/70">
                Salir de tu cuenta
              </p>
            </div>
          </button>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button variant="primary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

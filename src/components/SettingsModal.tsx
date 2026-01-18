'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useMediaStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { Upload, Trash2, LogOut, Camera, User, Loader2, Lock, Mail, CheckCircle, FileJson, FileSpreadsheet } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ErrorWithMessage {
  message?: string;
}

interface ImportedItem {
  title?: string;
  type?: string;
  status?: string;
  rating?: string | number;
  review?: string;
  author?: string;
  platform?: string;
  genres?: string;
  coverUrl?: string;
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
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSendingPasswordEmail, setIsSendingPasswordEmail] = useState(false);
  const [isPasswordEmailSent, setIsPasswordEmailSent] = useState(false);
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
      
      window.location.reload();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      const errorWithMessage = error as ErrorWithMessage;
      toast.error(errorWithMessage.message || 'Error al subir la imagen');
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
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Error al eliminar la imagen');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `kata-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success(`Biblioteca exportada como JSON (${items.length} items)`);
  };

  const handleExportCSV = () => {
    // Headers CSV
    const headers = ['ID', 'Título', 'Tipo', 'Estado', 'Valoración', 'Autor', 'Plataforma', 'Año', 'Géneros', 'Reseña', 'Fecha Creación', 'Fecha Actualización'];
    
    // Convertir items a filas CSV
    const rows = items.map(item => [
      item.id,
      `"${item.title.replace(/"/g, '""')}"`, // Escapar comillas
      item.type,
      item.status,
      item.rating?.toString() || '',
      item.author ? `"${item.author.replace(/"/g, '""')}"` : '',
      item.platform ? `"${item.platform.replace(/"/g, '""')}"` : '',
      item.releaseYear?.toString() || '',
      item.genres ? `"${item.genres.join(', ').replace(/"/g, '""')}"` : '',
      item.review ? `"${item.review.replace(/"/g, '""')}"` : '',
      item.createdAt,
      item.updatedAt || '',
    ]);
    
    // Crear contenido CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Crear blob y descargar
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM para Excel
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `kata-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    toast.success(`Biblioteca exportada como CSV (${items.length} items)`);
  };

  const validateImportData = (data: unknown): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
      errors.push('El formato debe ser un array de elementos');
      return { valid: false, errors };
    }

    if (data.length === 0) {
      errors.push('El archivo está vacío');
      return { valid: false, errors };
    }

    data.forEach((item: ImportedItem, index) => {
      const itemNum = index + 1;

      if (!item.title || typeof item.title !== 'string') {
        errors.push(`Item #${itemNum}: El título es requerido`);
      }

      if (!item.type || !['BOOK', 'GAME', 'MOVIE', 'SERIES'].includes(item.type)) {
        errors.push(`Item #${itemNum}: El tipo debe ser BOOK, GAME, MOVIE o SERIES`);
      }

      if (item.coverUrl && typeof item.coverUrl !== 'string') {
        errors.push(`Item #${itemNum}: La URL de portada debe ser un texto válido`);
      }

      if (item.rating !== null && item.rating !== undefined) {
        const rating = Number(item.rating);
        if (isNaN(rating) || rating < 0 || rating > 10) {
          errors.push(`Item #${itemNum}: La valoración debe estar entre 0 y 10`);
        }
      }
    });

    return { valid: errors.length === 0, errors };
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        const validation = validateImportData(data);

        if (!validation.valid) {
          toast.error(validation.errors[0]);
          return;
        }

        if (Array.isArray(data)) {
          setItems(data);
          toast.success(`${data.length} elementos importados`);
          onClose();
        }
      } catch {
        toast.error('Error al importar el archivo. Asegúrate de que sea un JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearLibrary = () => {
    setItems([]);
    setShowClearConfirm(false);
    toast.success('Biblioteca vaciada');
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
      
      window.location.reload();
    } catch (error) {
      console.error('Error updating username:', error);
      toast.error('Error al actualizar el nombre');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setIsSendingPasswordEmail(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('No se pudo obtener el email del usuario');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsPasswordEmailSent(true);
      toast.success('Email de recuperación enviado');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      const errorWithMessage = error as ErrorWithMessage;
      toast.error(errorWithMessage.message || 'Error al enviar el email de recuperación');
    } finally {
      setIsSendingPasswordEmail(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Sesión cerrada');
      // Usar window.location para forzar una navegación completa y limpiar el estado
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajustes" size="lg">
      <div className="space-y-5 sm:space-y-6">
        {/* User Info Section */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 sm:mb-4">
            Perfil
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {/* Avatar */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
                Foto de Perfil
              </label>
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Avatar preview */}
                <div className="relative group flex-shrink-0">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-gradient-to-br from-[var(--accent-primary)] to-emerald-900 border-2 border-white/10 flex items-center justify-center">
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

            {/* Cambiar contraseña */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                Contraseña
              </label>
              {!isPasswordEmailSent ? (
                !isChangingPassword ? (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 text-left transition-colors hover:bg-[var(--bg-tertiary)]/80"
                  >
                    <Lock size={18} className="text-[var(--text-tertiary)]" />
                    <span className="text-sm text-white">Cambiar contraseña</span>
                  </button>
                ) : (
                  <div className="space-y-3 rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Mail size={18} className="text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white mb-1">
                          Enviar email de recuperación
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)] mb-4">
                          Te enviaremos un enlace seguro a tu email para cambiar tu contraseña
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsChangingPassword(false);
                            }}
                            disabled={isSendingPasswordEmail}
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleChangePassword}
                            isLoading={isSendingPasswordEmail}
                          >
                            {isSendingPasswordEmail ? 'Enviando...' : 'Enviar email'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <CheckCircle size={18} className="text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-400 mb-1">
                        Email enviado
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)] mb-3">
                        Hemos enviado un enlace de recuperación a tu email. Revisa tu bandeja de entrada y spam.
                      </p>
                      <button
                        onClick={() => {
                          setIsPasswordEmailSent(false);
                          setIsChangingPassword(false);
                        }}
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        Enviar de nuevo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 sm:mb-4">
            Gestión de Datos
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              className="flex w-full items-center gap-2 sm:gap-3 rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 sm:p-4 text-left transition-colors hover:bg-[var(--bg-tertiary)]/80"
            >
              <FileJson size={18} className="sm:w-5 sm:h-5 text-[var(--accent-primary)] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-white">Exportar como JSON</p>
                <p className="text-xs text-[var(--text-tertiary)] line-clamp-1">
                  Descarga tu biblioteca en formato JSON ({items.length} items)
                </p>
              </div>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="flex w-full items-center gap-2 sm:gap-3 rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 sm:p-4 text-left transition-colors hover:bg-[var(--bg-tertiary)]/80"
            >
              <FileSpreadsheet size={18} className="sm:w-5 sm:h-5 text-[var(--accent-primary)] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-white">Exportar como CSV</p>
                <p className="text-xs text-[var(--text-tertiary)] line-clamp-1">
                  Descarga tu biblioteca en formato CSV para Excel ({items.length} items)
                </p>
              </div>
            </button>

            {/* Import */}
            <label className="flex w-full cursor-pointer items-center gap-2 sm:gap-3 rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 sm:p-4 transition-colors hover:bg-[var(--bg-tertiary)]/80">
              <Upload size={18} className="sm:w-5 sm:h-5 text-[var(--accent-primary)] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-white">Importar Biblioteca</p>
                <p className="text-xs text-[var(--text-tertiary)] line-clamp-1">
                  Restaurar desde una exportación anterior
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
                  <p className="text-sm font-medium text-red-400">Vaciar Biblioteca</p>
                  <p className="text-xs text-red-400/70">
                    Eliminar todos los elementos de tu biblioteca
                  </p>
                </div>
              </button>
            ) : (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <p className="mb-3 text-sm text-red-400">
                  ¿Estás seguro? Esto eliminará permanentemente todos los {items.length} elementos.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleClearLibrary}
                  >
                    Sí, Vaciar Todo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* App Info */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 sm:mb-4">
            Acerca de
          </h3>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Versión</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Total de Elementos</span>
              <span className="text-white">{items.length}</span>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 sm:mb-4">
            Cuenta
          </h3>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 sm:gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3 sm:p-4 text-left transition-colors hover:bg-red-500/10"
          >
            <LogOut size={18} className="sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-red-400">Cerrar Sesión</p>
              <p className="text-xs text-red-400/70 line-clamp-1">
                Salir de tu cuenta
              </p>
            </div>
          </button>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-3 sm:pt-4 border-t border-white/10">
          <Button variant="primary" onClick={onClose} size="sm" className="text-xs sm:text-sm">
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

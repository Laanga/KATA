'use client';
import { FilePicker, Checkbox } from '@/components/ui/Choice';
import { ActionButton } from '@/components/ui/Button';
import { TextInput, FileInput } from '@/components/ui/Field';

import { MediaCover } from '@/components/media/MediaCover';

import { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useMediaStore } from '@/lib/store';
import toast from 'react-hot-toast';
import {
  Upload,
  Trash2,
  LogOut,
  Camera,
  User,
  Loader2,
  Lock,
  Mail,
  CheckCircle,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  createBackup,
  exportCSV,
  parseImport,
  type LibraryBackup,
} from '@/lib/utils/libraryTransfer';
import { sameMedia } from '@/lib/utils/mediaIdentity';
import { useOnboarding } from './OnboardingProvider';
import { useRouter } from 'next/navigation';
import { saveAvatar, removeAvatar } from '@/lib/supabase/avatar';
import { isValidUsername } from '@/lib/utils/validation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { save: saveOnboarding } = useOnboarding();
  const router = useRouter();
  const items = useMediaStore((state) => state.items);
  const importLibrary = useMediaStore((state) => state.importLibrary);
  const clearLibrary = useMediaStore((state) => state.clearLibrary);
  const collections = useMediaStore((state) => state.collections);
  const relationships = useMediaStore((state) => state.collectionItemIds);
  const [pendingImport, setPendingImport] = useState<LibraryBackup | null>(null);
  const [replaceImport, setReplaceImport] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
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
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Cargar datos del usuario
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Detectar si el usuario se registró con Google OAuth
        const hasGoogleIdentity = user.identities?.some(
          (identity) => identity.provider === 'google',
        );
        setIsGoogleUser(!!hasGoogleIdentity);

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

    e.target.value = '';
    setIsUploadingAvatar(true);
    try {
      setAvatarUrl(await saveAvatar(file, avatarUrl));
      toast.success('Foto de perfil actualizada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar la imagen');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;
    setIsUploadingAvatar(true);
    try {
      await removeAvatar(avatarUrl);
      setAvatarUrl(null);
      toast.success('Foto de perfil eliminada');
    } catch {
      toast.error('No se pudo eliminar la imagen');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(createBackup(items, collections, relationships), null, 2);
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
    const csvContent = exportCSV(items);

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

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo debe ocupar menos de 10 MB');
      return;
    }
    try {
      setPendingImport(parseImport(await file.text(), file.name));
      setReplaceImport(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Archivo inválido');
    }
  };

  const confirmImport = async () => {
    if (!pendingImport || isTransferring) return;
    setIsTransferring(true);
    try {
      const count = await importLibrary(pendingImport, replaceImport);
      toast.success(`${count} elementos guardados. Los duplicados existentes se han conservado.`);
      setPendingImport(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'No se pudo importar. No se ha aplicado la operación.',
      );
    } finally {
      setIsTransferring(false);
    }
  };

  const handleClearLibrary = async () => {
    if (isTransferring) return;
    setIsTransferring(true);
    try {
      await clearLibrary();
      setShowClearConfirm(false);
      toast.success('Biblioteca vaciada. Tus colecciones se conservan vacías.');
    } catch {
      toast.error('No se pudo vaciar la biblioteca. Inténtalo de nuevo.');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!isValidUsername(username)) {
      toast.error('Usa entre 3 y 30 caracteres: letras, números, guiones o guiones bajos');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { username: username.trim() },
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
      toast.error(
        error instanceof Error ? error.message : 'Error al enviar el email de recuperación',
      );
    } finally {
      setIsSendingPasswordEmail(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Sesión cerrada');
      // Usar window.location para forzar una navegación completa y limpiar el estado
      router.replace('/');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isTransferring) onClose();
      }}
      title="Ajustes"
      size="lg"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* User Info Section */}
        <div>
          <h3 className="kata-section-label text-[var(--text-secondary)] mb-2 sm:mb-4">Perfil</h3>
          <div className="space-y-3 sm:space-y-4">
            {/* Avatar */}
            <div>
              <label className="kata-label">Foto de Perfil</label>
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Avatar preview */}
                <div className="relative group flex-shrink-0">
                  <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-gradient-to-br from-[var(--accent-primary)] to-emerald-900 border-2 border-white/10 flex items-center justify-center">
                    {avatarUrl ? (
                      <MediaCover
                        width={96}
                        height={128}
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={28} className="text-white/70 sm:size-[32]" />
                    )}
                  </div>

                  {/* Overlay con botón de cámara */}
                  <Button
                    variant="ghost"
                    aria-label="Cambiar foto de perfil"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="kata-avatar-action absolute inset-0"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 size={24} className="text-white animate-spin" />
                    ) : (
                      <Camera size={24} className="text-white" />
                    )}
                  </Button>
                </div>

                {/* Botones */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? 'Subiendo...' : 'Cambiar foto'}
                  </Button>
                  {avatarUrl && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={isUploadingAvatar}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>

                {/* Input oculto */}
                <FileInput
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <p className="mt-1.5 text-xs text-[var(--text-tertiary)] sm:mt-2">
                JPG, PNG o GIF. Máximo 2MB.
              </p>
            </div>

            {/* Username */}
            <div>
              <label className="kata-label">Nombre de Usuario</label>
              <div className="flex gap-2">
                <TextInput
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!isEditingUsername || isSaving}
                  className="flex-1 min-w-0"
                  placeholder="Tu nombre"
                />
                {!isEditingUsername ? (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setIsEditingUsername(true)}
                    className=""
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
                            setUsername(
                              user.user_metadata?.username ||
                                user.email?.split('@')[0] ||
                                'Usuario',
                            );
                          }
                        });
                      }}
                      disabled={isSaving}
                      className=""
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSaveUsername}
                      isLoading={isSaving}
                      className=""
                    >
                      Guardar
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="kata-label">Email</label>
              <TextInput type="email" value={email} disabled className="w-full" />
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                El email no se puede modificar
              </p>
            </div>

            {/* Cambiar contraseña - SOLO si NO es usuario de Google */}
            {!isGoogleUser && (
              <div>
                <label className="kata-label">Contraseña</label>
                {!isPasswordEmailSent ? (
                  !isChangingPassword ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsChangingPassword(true)}
                      className="w-full justify-start"
                    >
                      <Lock size={16} className="text-[var(--text-tertiary)] sm:size-[18]" />
                      <span className="text-xs text-white sm:text-sm">Cambiar contraseña</span>
                    </Button>
                  ) : (
                    <div className="kata-panel kata-panel--subtle space-y-2.5 p-3 sm:space-y-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="mt-0.5">
                          <Mail size={16} className="text-emerald-400 sm:size-[18]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-white mb-1 sm:text-sm">
                            Enviar email de recuperación
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)] mb-3 sm:mb-4">
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
                              className=""
                            >
                              Cancelar
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleChangePassword}
                              isLoading={isSendingPasswordEmail}
                              className=""
                            >
                              {isSendingPasswordEmail ? 'Enviando...' : 'Enviar email'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="kata-notice">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="mt-0.5">
                        <CheckCircle size={16} className="text-emerald-400 sm:size-[18]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-emerald-400 mb-1 sm:text-sm">
                          Email enviado
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)] mb-2 sm:mb-3">
                          Hemos enviado un enlace de recuperación a tu email. Revisa tu bandeja de
                          entrada y spam.
                        </p>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsPasswordEmailSent(false);
                            setIsChangingPassword(false);
                          }}
                        >
                          Enviar de nuevo
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Data Management */}
        <div>
          <h3 className="kata-section-label text-[var(--text-secondary)] mb-2 sm:mb-4">
            Gestión de Datos
          </h3>
          <div className="space-y-1.5 sm:space-y-3">
            {/* Export JSON */}
            <ActionButton onClick={handleExportJSON}>
              <FileJson
                size={16}
                className="text-[var(--accent-primary)] flex-shrink-0 sm:w-5 sm:h-5"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white sm:text-sm">Exportar como JSON</p>
                <p className="text-xs text-[var(--text-tertiary)] line-clamp-1 sm:text-sm">
                  Descarga tu biblioteca en formato JSON ({items.length} items)
                </p>
              </div>
            </ActionButton>

            {/* Export CSV */}
            <ActionButton onClick={handleExportCSV}>
              <FileSpreadsheet
                size={16}
                className="text-[var(--accent-primary)] flex-shrink-0 sm:w-5 sm:h-5"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white sm:text-sm">Exportar como CSV</p>
                <p className="text-xs text-[var(--text-tertiary)] line-clamp-1 sm:text-sm">
                  Descarga tu biblioteca en formato CSV para Excel ({items.length} items)
                </p>
              </div>
            </ActionButton>

            {/* Import */}
            <FilePicker
              accept=".json,.csv"
              onChange={handleImport}
              disabled={isTransferring}
              aria-label="Importar biblioteca"
            >
              <Upload
                size={16}
                className="text-[var(--accent-primary)] flex-shrink-0 sm:w-5 sm:h-5"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white sm:text-sm">Importar Biblioteca</p>
                <p className="text-xs text-[var(--text-tertiary)] line-clamp-1 sm:text-sm">
                  Restaurar desde una exportación JSON o CSV
                </p>
              </div>
            </FilePicker>

            {pendingImport && (
              <div className="kata-panel kata-panel--accent space-y-3" aria-live="polite">
                <p className="font-medium">Revisar importación</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {pendingImport.items.length} elementos · {pendingImport.collections?.length || 0}{' '}
                  colecciones ·{' '}
                  {
                    pendingImport.items.filter((incoming) =>
                      items.some((item) => sameMedia(item, incoming)),
                    ).length
                  }{' '}
                  coincidencias con tu biblioteca.
                </p>
                <label className="flex gap-2 text-sm">
                  <Checkbox
                    checked={replaceImport}
                    disabled={isTransferring}
                    onChange={(e) => setReplaceImport(e.target.checked)}
                  />
                  Reemplazar los elementos actuales
                </label>
                <p className="text-sm text-[var(--text-secondary)]">
                  {replaceImport
                    ? 'Se eliminarán los elementos actuales. Si la copia incluye colecciones, también las reemplazará. La operación se aplica completa o no se aplica.'
                    : 'Se añadirán elementos nuevos y se conservarán las notas y estados de los existentes.'}
                </p>
                <div className="flex gap-2">
                  <Button onClick={confirmImport} isLoading={isTransferring}>
                    {replaceImport ? 'Confirmar reemplazo' : 'Fusionar biblioteca'}
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={isTransferring}
                    onClick={() => setPendingImport(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
            {/* Clear Library */}
            {!showClearConfirm ? (
              <ActionButton variant="danger" onClick={() => setShowClearConfirm(true)}>
                <Trash2 size={16} className="text-red-400 sm:size-[20]" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-red-400 sm:text-sm">Vaciar Biblioteca</p>
                  <p className="text-xs text-red-400/70 sm:text-sm">
                    Eliminar todos los elementos de tu biblioteca
                  </p>
                </div>
              </ActionButton>
            ) : (
              <div className="kata-notice kata-notice--error">
                <p className="mb-2 text-xs text-red-400 sm:mb-3 sm:text-sm">
                  ¿Estás seguro? Esto eliminará permanentemente todos los {items.length} elementos.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowClearConfirm(false)}
                    className=""
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleClearLibrary}
                    isLoading={isTransferring}
                    className=""
                  >
                    Sí, Vaciar Todo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          onClick={async () => {
            try {
              await saveOnboarding({
                onboarding_status: 'in_progress',
                onboarding_step: 1,
                finished_at: null,
              });
              onClose();
              router.push('/onboarding');
            } catch {
              toast.error('No pudimos abrir la bienvenida. Inténtalo de nuevo.');
            }
          }}
        >
          Retomar la bienvenida
        </Button>
        {/* App Info */}
        <div>
          <h3 className="kata-section-label text-[var(--text-secondary)] mb-2 sm:mb-4">
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
          <h3 className="kata-section-label text-[var(--text-secondary)] mb-2 sm:mb-4">Cuenta</h3>
          <ActionButton variant="danger" onClick={handleLogout}>
            <LogOut size={16} className="text-red-400 flex-shrink-0 sm:w-5 sm:h-5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-red-400 sm:text-sm">Cerrar Sesión</p>
              <p className="text-xs text-red-400/70 line-clamp-1 sm:text-sm">Salir de tu cuenta</p>
            </div>
          </ActionButton>
        </div>

        {/* Close Button */}
        <div className="kata-action-row">
          <Button variant="primary" onClick={onClose} size="sm" className="">
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

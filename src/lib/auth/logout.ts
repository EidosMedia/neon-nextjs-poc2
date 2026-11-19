/** Clears the web-user session server-side and reloads the page. */
export async function logoutWebUser(): Promise<void> {
  await fetch('/api/users/logout', { method: 'POST', credentials: 'include' });
  window.location.reload();
}

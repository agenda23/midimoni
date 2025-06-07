export async function onRequest(context: any) {
  const response = await context.next();
  
  // MIDI API用のヘッダーを追加
  response.headers.set('Permissions-Policy', 'midi=*');
  response.headers.set('Feature-Policy', 'midi *');
  
  return response;
} 
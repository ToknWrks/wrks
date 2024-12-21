export function logError(error: unknown, context: string = '', silent: boolean = false) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  if (!silent) {
    console.error('Error:', {
      context,
      message: errorMessage,
      type: error instanceof Error ? error.name : typeof error,
      originalError: error instanceof Error ? error.message : String(error)
    });
  }
  
  return errorMessage;
}

export function handleKeplrError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('not installed')) {
      return 'Please install Keplr wallet extension';
    }
    if (error.message.includes('rejected')) {
      return 'Request rejected by user';
    }
    if (error.message.includes('timeout')) {
      return 'Connection timed out - please try again';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}
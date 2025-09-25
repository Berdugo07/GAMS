export async function imageToBase64(path: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fetch(path)
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String);
        };
        reader.readAsDataURL(blob);
      })
      .catch((error) => {
        reject(`Error generate image Base64: ${error}`);
      });
  });
}

declare module '../api/uploadFileApi' {
  interface UploadFileApi {
    uploadFile(event: any): Promise<string>;
  }
  const uploadFileApi: UploadFileApi;
  export default uploadFileApi;
}

export {}; 
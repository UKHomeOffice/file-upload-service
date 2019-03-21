class StorageController {
  constructor(storageService, config) {
    this.storageService = storageService;
    this.config = config;
    this.downloadFile = this.downloadFile.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
  }

  async downloadFile(req, res) {
    const {logger, params} = req;
    const {processKey, fileVersion, filename} = params;
    logger.info('Downloading file');

    try {
      const {Body, ContentType, Metadata} = await this.storageService.downloadFile(processKey, fileVersion, filename);
      logger.info('File downloaded');
      res
        .set('Content-Type', ContentType)
        .set('Content-Disposition', `attachment; filename=${Metadata.originalfilename}`)
        .status(200)
        .send(Body);
    } catch (err) {
      logger.error('Failed to download file');
      logger.error(err.toString());
      res.status(500).json({error: 'Failed to download file'});
    }
  }

  async uploadFile(req, res, next) {
    const {file, logger, params} = req;
    file.version = file.version || this.config.fileVersions.original;

    logger.info(`Uploading file - ${file.version} version`);

    try {
      await this.storageService.uploadFile(params.processKey, file);
      logger.info(`File uploaded - ${file.version} version`);
      next();
    } catch (err) {
      logger.error(`Failed to upload file - ${file.version} version`);
      logger.error(err.toString());
      res.status(500).json({error: `Failed to upload file - ${file.version} version`});
    }
  }
}

export default StorageController;

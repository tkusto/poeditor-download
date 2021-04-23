const fetch = require('node-fetch')
const FormData = require('form-data')

const API_URL = {
  EXPORT: 'https://api.poeditor.com/v2/projects/export'
}

/**
 * @typedef {Object} POEditorClientParams
 * @property {string} apiToken - POEditor API token
 * @property {string} projectId - POEditor project ID
 */

class POEditorClient {
  /**
   * POEditor Client constructor
   * @param {POEditorClientParams} config
   */
  constructor({ apiToken, projectId }) {
    this._projectId = projectId
    this._apiToken = apiToken
  }

  /**
   * Download POEditor public translations
   * @param {string} lang - language to download
   * @returns {Promise<string>}
   */
  async export(lang) {
    const fileUrl = await this._getExportFileUrl(lang)
    const res = await fetch(fileUrl)
    const content = await res.text()
    return content
  }

  /**
   * Return URL of exported file
   * @param {string} lang
   * @returns {Promise<string>}
   */
  async _getExportFileUrl(lang) {
    const reqBody = new FormData();
    reqBody.append('api_token', this._apiToken);
    reqBody.append('id', this._projectId);
    reqBody.append('language', lang);
    reqBody.append('type', 'key_value_json');
    reqBody.append('filters', 'translated');

    const res = await fetch(API_URL.EXPORT, {
      method: 'POST',
      body: reqBody
    })

    /**
     * @type {POEditorExportResponse}
     */
    const data = await res.json()
    return data.result.url
  }
}

module.exports = POEditorClient

/**
 * @typedef {Object} POEditorResponse
 * @property {string} status
 * @property {string} code
 * @property {string} message
 */

/**
 * @typedef {Object} POEditorExportResponse
 * @property {POEditorResponse} response
 * @property {Object} result
 * @property {string} result.url
 */


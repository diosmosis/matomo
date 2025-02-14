/*!
 * Matomo - free/libre analytics platform
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

export default function translate(translationStringId: string, values: string[] = []): string {
  return window._pk_translate(translationStringId, values); // eslint-disable-line
}

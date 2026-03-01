"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalDateStringAmericaBahia = getLocalDateStringAmericaBahia;
exports.normalizeDateOnly = normalizeDateOnly;
exports.getCurrentMonthRangeBahia = getCurrentMonthRangeBahia;
const luxon_1 = require("luxon");
const TZ_BAHIA = "America/Bahia";
/**
 * Retorna a data atual no timezone America/Bahia no formato 'YYYY-MM-DD'.
 *
 * IMPORTANTE - Evitando bugs de fuso:
 * - Nunca use `new Date()` ou `Date.now()` para "data do dia" em um timezone específico.
 *   Em UTC-3, às 22h de um dia, em UTC já pode ser o dia seguinte.
 * - Luxon resolve isso: DateTime.now().setZone(TZ) considera o fuso ao extrair ano/mês/dia.
 * - O formato ISO 'YYYY-MM-DD' é ambíguo: não carrega timezone. Por isso sempre
 *   geramos a string a partir do momento "agora" no fuso correto.
 */
function getLocalDateStringAmericaBahia() {
    return luxon_1.DateTime.now().setZone(TZ_BAHIA).toISODate() ?? "";
}
/**
 * Converte uma string 'YYYY-MM-DD' em um Date em UTC 00:00:00, ideal para salvar
 * sessionDate no banco (coluna DATE ou DateTime com apenas a parte da data).
 *
 * IMPORTANTE - Evitando bugs de fuso:
 * - 'YYYY-MM-DD' é "data civil": não tem hora nem fuso. Ao salvar no Postgres como
 *   DATE ou DateTime, queremos que represente "aquele dia" de forma unívoca.
 * - Estratégia: interpretar a string como data em UTC e criar meia-noite UTC.
 *   Assim, "2025-02-25" -> 2025-02-25T00:00:00.000Z. O Postgres extrai a data e
 *   armazena corretamente, independente do timezone do servidor.
 * - NUNCA use `new Date('2025-02-25')`: embora o JS interprete como UTC meia-noite,
 *   o comportamento pode variar entre ambientes. Luxon com zone explícita é seguro.
 * - Ao EXIBIR datas para o usuário em Bahia, use getLocalDateStringAmericaBahia()
 *   ou DateTime.fromJSDate(d).setZone(TZ_BAHIA).toISODate().
 */
function normalizeDateOnly(dateString) {
    const parsed = luxon_1.DateTime.fromISO(dateString, { zone: "utc" });
    if (!parsed.isValid) {
        throw new Error(`Data inválida: ${dateString}. Use formato YYYY-MM-DD.`);
    }
    return parsed.startOf("day").toJSDate();
}
/**
 * Retorna o intervalo [início, fim] do mês atual em America/Bahia.
 * Útil para queries de "mês atual".
 */
function getCurrentMonthRangeBahia() {
    const now = luxon_1.DateTime.now().setZone(TZ_BAHIA);
    const start = now.startOf("month").toUTC().toJSDate();
    const end = now.endOf("month").toUTC().toJSDate();
    return { start, end };
}
//# sourceMappingURL=dateUtils.js.map
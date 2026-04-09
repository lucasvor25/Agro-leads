import { sanitizeString } from './sanitize.util';

describe('sanitizeString', () => {
  it('deve retornar a string sem alteração se não houver HTML', () => {
    expect(sanitizeString('Fazenda Boa Vista')).toBe('Fazenda Boa Vista');
  });

  it('deve remover tags HTML maliciosas', () => {
    expect(sanitizeString('<script>alert("xss")</script>Texto limpo')).toBe('Texto limpo');
  });

  it('deve remover tags HTML de formatação', () => {
    expect(sanitizeString('<b>Negrito</b>')).toBe('Negrito');
  });

  it('deve fazer trim da string resultante', () => {
    expect(sanitizeString('  espaços  ')).toBe('espaços');
  });

  it('deve retornar string vazia para input somente com HTML', () => {
    expect(sanitizeString('<div><p></p></div>')).toBe('');
  });

  it('deve retornar undefined se o valor for undefined', () => {
    expect(sanitizeString(undefined)).toBeUndefined();
  });

  it('deve retornar null se o valor for null', () => {
    expect(sanitizeString(null)).toBeNull();
  });

  it('deve retornar string vazia para string vazia', () => {
    expect(sanitizeString('')).toBe('');
  });

  it('deve remover atributos on* de tags HTML', () => {
    expect(sanitizeString('<img src="x" onerror="alert(1)">')).toBe('');
  });

  it('deve preservar caracteres especiais válidos', () => {
    const input = 'São José & Companhia - 100%';
    expect(sanitizeString(input)).toContain('São José');
  });
});

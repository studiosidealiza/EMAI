import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { email, workshopInput, settingsInput, integer } from '../lib/validation.js';
import { defaultContent, socialLinks } from '../lib/content.js';

const now=Date.parse('2026-01-01T00:00:00Z');
const valid=()=>({id:randomUUID(),institution:'Escola de teste',location:'Rua da Escola, 10, Fortaleza',date:'2026-06-10',time:'14:30',people:30,extraSeats:2,email:' Escola@Example.org ',consent:true});
test('Normaliza e-mail e rejeita endereços inválidos',()=>{
  assert.equal(email(' Pessoa@Example.org '),'pessoa@example.org');
  for(const value of ['sem-arroba','a@b','a b@c.org','\n'])assert.throws(()=>email(value));
});
test('Converte o horário de Fortaleza e preserva as vagas adicionais',()=>{
  const result=workshopInput(valid(),now);
  assert.equal(result.starts_at,'2026-06-10T17:30:00.000Z');
  assert.equal(result.people,30);assert.equal(result.extra_seats,2);
});
test('Rejeita datas impossíveis, passadas, horários inválidos e falta de consentimento',()=>{
  for(const change of [{date:'2026-02-30'},{date:'2025-12-31'},{time:'25:00'},{date:'2029-01-01'},{consent:false}])
    assert.throws(()=>workshopInput({...valid(),...change},now));
});
test('Valida limites inteiros, inclusive zero vagas extras',()=>{
  assert.equal(integer('0','Vagas',0,500),0);
  for(const value of [-1,501,1.5,'',null,true])assert.throws(()=>integer(value,'Vagas',0,500));
});
test('Configurações bloqueiam links externos maliciosos e menus inconsistentes',()=>{
  assert.equal(settingsInput(defaultContent,defaultContent).menus.length,5);
  for(const githubUrl of ['javascript:alert(1)','https://github.com.evil.org/a/b','https://github.com/a/b/issues'])
    assert.throws(()=>settingsInput({...defaultContent,githubUrl},defaultContent));
  assert.throws(()=>settingsInput({...defaultContent,menus:defaultContent.menus.map(m=>({...m,visible:false}))},defaultContent));
  assert.throws(()=>settingsInput({...defaultContent,menus:Array(5).fill(defaultContent.menus[0])},defaultContent));
});
test('Destinos dos menus são fixos mesmo se o cliente tentar alterá-los',()=>{
  const menus=defaultContent.menus.map(m=>({...m,href:'https://example.org'}));
  assert.deepEqual(settingsInput({...defaultContent,menus},defaultContent).menus.map(m=>m.href),defaultContent.menus.map(m=>m.href));
});
test('Redes oficiais apontam para os endereços solicitados',()=>{
  assert.deepEqual(socialLinks.map(s=>s.href),['https://www.instagram.com/emai.ufc/','https://www.tiktok.com/@emai.ufc?']);
});

'use client'

import { useActionState } from 'react'
import { updateEmailTemplate, type EventState } from '../actions'

interface Props {
  template: {
    id: string
    subject: string
    body_html: string
  }
  label: string
  color: string
}

export default function EmailTemplateForm({ template, label, color }: Props) {
  const [state, formAction, isPending] = useActionState<EventState, FormData>(updateEmailTemplate, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={template.id} />

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '5px 5px 0 rgba(81,104,129,0.15)',
          overflow: 'hidden',
          marginBottom: '28px',
        }}
      >
        <div style={{ height: '6px', backgroundColor: color }} />
        <div style={{ padding: '28px 32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#516881', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '6px',
                backgroundColor: color,
                color: '#fff',
                fontSize: '12px',
              }}
            >
              {label}
            </span>
            メールテンプレート
          </h2>

          {state?.error && (
            <div style={{ backgroundColor: '#fff0f3', border: '2px solid #fe4c7f', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px', fontSize: '13px', color: '#c0234a' }}>
              ⚠️ {state.error}
            </div>
          )}

          {state === null && isPending === false && (
            <div style={{ backgroundColor: '#f0fffe', border: '2px solid #30b9bf', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px', fontSize: '13px', color: '#1a8a8f', display: 'none' }} id={`saved-${template.id}`}>
              ✓ 保存しました
            </div>
          )}

          {/* 件名 */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor={`subject-${template.id}`}
              style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#516881', marginBottom: '6px' }}
            >
              件名
            </label>
            <input
              className="form-input"
              type="text"
              id={`subject-${template.id}`}
              name="subject"
              defaultValue={template.subject}
            />
          </div>

          {/* 本文 */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor={`body-${template.id}`}
              style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#516881', marginBottom: '6px' }}
            >
              本文（HTML可）
            </label>
            <textarea
              className="form-textarea"
              id={`body-${template.id}`}
              name="body_html"
              defaultValue={template.body_html}
              style={{ minHeight: '180px', fontFamily: 'monospace', fontSize: '13px' }}
            />
          </div>

          {/* プレースホルダー説明 */}
          <div
            style={{
              backgroundColor: '#f7fbfe',
              border: '1.5px solid #d9eaf4',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '12px',
              color: '#555',
              marginBottom: '20px',
            }}
          >
            <p style={{ margin: '0 0 6px', fontWeight: '700', color: '#516881' }}>使用できるプレースホルダー</p>
            <p style={{ margin: '0 0 3px' }}><code style={{ backgroundColor: '#e8f4fb', padding: '1px 5px', borderRadius: '3px' }}>{'{{name}}'}</code> — 申込者の氏名</p>
            <p style={{ margin: 0 }}><code style={{ backgroundColor: '#e8f4fb', padding: '1px 5px', borderRadius: '3px' }}>{'{{event_title}}'}</code> — イベント名</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isPending}
              className="btn-teal"
              style={{ padding: '10px 28px', height: 'auto', width: 'auto', fontSize: '14px', opacity: isPending ? 0.7 : 1 }}
            >
              {isPending ? '保存中...' : '保存する'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

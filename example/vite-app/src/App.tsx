import { EmailBuilder, EmailBuilderProvider } from 'create-email-template'
import type {
  AutosavePayload,
  EmailBuilderConfig,
  UploadImage,
} from 'create-email-template'

/**
 * Config de muestra: todos los campos son opcionales; quita o cambia lo que
 * necesites. Si omites `config` por completo, el builder usa los defaults.
 */
const config: EmailBuilderConfig = {
  blockDefaults: {
    text: {
      text: 'Hola {firstName}, gracias por ser parte de nuestra comunidad.',
      size: 15,
    },
    button: {
      label: 'Quiero mi cupo',
      href: '{registerUrl}',
      backgroundColor: '#d7b227',
      color: '#0d0b08',
    },
    footer: {
      text: 'Recibes este correo por estar registrado en {companyName}. Date de baja en {unsubscribeUrl}',
      brandName: 'Mi Marca',
    },
  },
  sampleContext: {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@ejemplo.com',
    companyName: 'Mi Empresa',
    registerUrl: 'https://mi-sitio.com/registro',
    unsubscribeUrl: 'https://mi-sitio.com/baja',
    supportEmail: 'soporte@mi-sitio.com',
  },
}

/** Subida de imágenes demo: URL blob local temporal (en prod, sube a tu CDN). */
const uploadImage: UploadImage = async (file) => {
  await new Promise((resolve) => setTimeout(resolve, 600))
  return URL.createObjectURL(file)
}

/**
 * Autoguardado demo (simula el backend; la librería nunca hace network).
 * Contrato real de tu endpoint:
 *   PUT /templates/:id  →  { json: payload, html }
 */
const onSave = async (payload: AutosavePayload) => {
  await new Promise((resolve) => setTimeout(resolve, 400))
  console.info('[autosave] payload guardado:', payload)
  return { json: payload, html: '<!-- renderizado por tu backend -->' }
}

function App() {
  return (
    <EmailBuilderProvider
      config={config}
      uploadImage={uploadImage}
      autosave={{
        intervalMs: 10_000,
        onSave,
        onSaved: (result) => {
          if (!result.ok) console.error('[autosave] error:', result.error)
        },
      }}
    >
      <EmailBuilder />
    </EmailBuilderProvider>
  )
}

export default App

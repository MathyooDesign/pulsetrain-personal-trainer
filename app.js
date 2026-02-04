const exerciseDB = [
  {
    id: 1,
    name: 'Flexiones',
    category: 'upper',
    reps: '3x12',
    equip: 'ninguno',
    loc: ['casa', 'gimnasio', 'aire_libre'],
    tags: ['wrists'],
    alt: 'Flexiones inclinadas'
  },
  {
    id: 2,
    name: 'Press Militar',
    category: 'upper',
    reps: '3x10',
    equip: 'basico',
    loc: ['gimnasio', 'casa'],
    tags: ['shoulders'],
    alt: 'Elevaciones laterales'
  },
  {
    id: 3,
    name: 'Sentadillas',
    category: 'lower',
    reps: '3x15',
    equip: 'ninguno',
    loc: ['casa', 'gimnasio', 'aire_libre'],
    tags: ['knees'],
    alt: 'Sentadilla a banco'
  },
  {
    id: 4,
    name: 'Zancadas Dinámicas',
    category: 'lower',
    reps: '3x10',
    equip: 'ninguno',
    loc: ['aire_libre', 'gimnasio'],
    tags: ['knees', 'ankles'],
    alt: 'Zancada estática'
  },
  {
    id: 5,
    name: 'Dominadas / Pull-ups',
    category: 'upper',
    reps: '3x8',
    equip: 'ninguno',
    loc: ['aire_libre', 'gimnasio'],
    tags: ['shoulders'],
    alt: 'Remo invertido'
  },
  {
    id: 6,
    name: 'Plancha Abdominal',
    category: 'core',
    reps: '3x45s',
    equip: 'ninguno',
    loc: ['casa', 'gimnasio', 'aire_libre'],
    tags: ['back'],
    alt: 'Plancha rodillas'
  }
]

const injuriesList = [
  'Cuello',
  'Hombros',
  'Codos',
  'Muñecas',
  'Espalda Alta',
  'Espalda Baja',
  'Cadera',
  'Rodillas',
  'Tobillos'
]
const injuryMap = {
  Cuello: 'neck',
  Hombros: 'shoulders',
  Codos: 'elbows',
  Muñecas: 'wrists',
  'Espalda Alta': 'upperback',
  'Espalda Baja': 'back',
  Cadera: 'hips',
  Rodillas: 'knees',
  Tobillos: 'ankles'
}
const days = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
]
let editingTarget = null

function init() {
  renderInjuryChecks()
  renderBaseColumns()
  loadFromStorage()
  lucide.createIcons()
}

function renderInjuryChecks() {
  document.getElementById('injuryContainer').innerHTML = injuriesList
    .map(
      (inj) => `
            <label class="flex items-center gap-1.5 p-2 border border-slate-100 rounded-lg cursor-pointer hover:bg-red-50 transition group">
                <input type="checkbox" name="injury" value="${injuryMap[inj]}" class="accent-red-500"> 
                <span class="text-[9px] font-bold uppercase text-slate-500">${inj}</span>
            </label>
        `
    )
    .join('')
}

function renderBaseColumns() {
  const board = document.getElementById('kanbanBoard')
  board.innerHTML = days
    .map(
      (day, idx) => `
            <div class="kanban-column bg-white rounded-3xl p-4 border border-slate-200 flex flex-col shadow-sm" data-idx="${idx}">
                <div class="flex justify-between items-center mb-4 px-2">
                    <h3 class="font-bold text-slate-700 text-sm">${day}</h3>
                    <span id="prog-${idx}" class="text-[10px] bg-slate-100 px-2 py-1 rounded-full font-bold">0/0</span>
                </div>
                <div class="column-handle h-8 bg-slate-50 rounded-xl mb-4 flex items-center justify-center text-slate-300 hover:bg-slate-100 transition"><i data-lucide="grip-horizontal" class="w-4 h-4"></i></div>
                <div id="list-${idx}" class="exercise-list space-y-3 flex-grow min-h-[300px]"></div>
                <div id="badge-${idx}" class="hidden mt-4 p-3 bg-green-500 text-white text-center rounded-2xl text-[9px] font-bold">LISTO 🏆</div>
            </div>
        `
    )
    .join('')
  initSortable()
}

function generatePlan() {
  const loc = document.getElementById('location').value
  const equip = document.getElementById('equipment').value
  const freq = parseInt(document.getElementById('frequency').value)
  const dur = parseInt(document.getElementById('duration').value)
  const exp = document.getElementById('experience').value
  const selectedInjuries = Array.from(
    document.querySelectorAll('input[name="injury"]:checked')
  ).map((c) => c.value)

  clearKanbanUIOnly()
  const activeDays = [...Array(7).keys()]
    .sort(() => Math.random() - 0.5)
    .slice(0, freq)
  const numEx = Math.max(2, Math.floor(dur / 12))

  activeDays.forEach((dayIdx) => {
    const list = document.getElementById(`list-${dayIdx}`)
    let count = 0
    let shuffled = [...exerciseDB].sort(() => Math.random() - 0.5)

    for (let ex of shuffled) {
      if (count >= numEx) break
      if (!ex.loc.includes(loc)) continue
      const equipRank = { ninguno: 0, basico: 1, completo: 2 }
      if (equipRank[ex.equip] > equipRank[equip]) continue

      let name = ex.name
      if (exp === '0') name = 'S: ' + ex.name
      if (exp === '3') name = 'I: ' + ex.name

      const adapted = ex.tags.some((t) => selectedInjuries.includes(t))
      if (adapted) name = ex.alt + ' (Adaptado)'

      list.innerHTML += createCardHTML(name, ex.reps, adapted)
      count++
    }
    list.innerHTML += createCardHTML(
      'Estiramiento',
      '5 min',
      false,
      'bg-teal-50 border-teal-200'
    )
  })
  showMotivation()
}

function createCardHTML(
  name,
  reps,
  adapted,
  customClass = 'bg-white border-slate-100'
) {
  return `
          <div class="exercise-card p-4 rounded-2xl border-2 shadow-sm transition-all ${customClass} group">
              <div class="flex items-start gap-3">
                  <button onclick="toggleExercise(this)" class="mt-1 w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center bg-white hover:border-green-500 transition"><i data-lucide="check" class="w-3 h-3 text-white"></i></button>
                  <div class="flex-grow min-w-0">
                      <div class="flex justify-between items-start">
                          <h4 class="text-xs font-bold truncate ex-name">${name}</h4>
                          <button onclick="editCard(this)" class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-indigo-500 ml-1"><i data-lucide="edit-2" class="w-3 h-3"></i></button>
                      </div>
                      <p class="text-[10px] text-slate-500 ex-reps">${reps}</p>
                  </div>
              </div>
          </div>`
}

function handleImport(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target.result
    if (file.name.endsWith('.json')) processJSON(JSON.parse(content))
    else if (file.name.endsWith('.csv')) processCSV(content)
  }
  reader.readAsText(file)
}

function processJSON(data) {
  clearKanbanUIOnly()
  data.forEach((dayData, idx) => {
    const list = document.getElementById(`list-${idx}`)
    if (list)
      dayData.exercises.forEach(
        (ex) => (list.innerHTML += createCardHTML(ex.name, ex.reps, false))
      )
  })
  finishImportUI()
}

function processCSV(content) {
  const lines = content.split('\n').slice(1)
  clearKanbanUIOnly()
  lines.forEach((line) => {
    const parts = line.split(',')
    if (parts.length < 3) return
    const day = parts[0].replace(/"/g, '').trim()
    const name = parts[1].replace(/"/g, '').trim()
    const reps = parts[2].replace(/"/g, '').trim()
    const idx = days.indexOf(day)
    if (idx !== -1)
      document.getElementById(`list-${idx}`).innerHTML += createCardHTML(
        name,
        reps,
        false
      )
  })
  finishImportUI()
}

function finishImportUI() {
  document.getElementById('placeholder').classList.add('hidden')
  document.getElementById('dashboard').classList.remove('hidden')
  updateCounts()
  saveToStorage()
  lucide.createIcons()
}

function clearKanbanUIOnly() {
  days.forEach((_, idx) => {
    const list = document.getElementById(`list-${idx}`)
    if (list) list.innerHTML = ''
  })
  updateCounts()
}

function resetAllData() {
  if (confirm('¿Borrar TODO?')) {
    localStorage.clear()
    window.location.reload()
  }
}
function toggleConfig() {
  document.getElementById('modalConfig').classList.toggle('hidden')
}
function triggerImport() {
  document.getElementById('importFile').click()
}
function saveToStorage() {
  localStorage.setItem(
    'pulse_v32_data',
    document.getElementById('kanbanBoard').innerHTML
  )
}
function loadFromStorage() {
  const data = localStorage.getItem('pulse_v32_data')
  if (data && data.length > 50) {
    document.getElementById('kanbanBoard').innerHTML = data
    document.getElementById('placeholder').classList.add('hidden')
    document.getElementById('dashboard').classList.remove('hidden')
    updateCounts()
    initSortable()
  }
}

function initSortable() {
  new Sortable(document.getElementById('kanbanBoard'), {
    handle: '.column-handle',
    animation: 250,
    onEnd: () => {
      fixDayOrder()
      saveToStorage()
    }
  })
  days.forEach(
    (_, idx) =>
      new Sortable(document.getElementById(`list-${idx}`), {
        group: 'shared',
        animation: 250,
        onEnd: () => {
          updateCounts()
          saveToStorage()
        }
      })
  )
}

function toggleExercise(btn) {
  const card = btn.closest('.exercise-card')
  card.classList.toggle('completed')
  const isDone = card.classList.contains('completed')
  btn.classList.toggle('bg-green-500', isDone)
  btn.classList.toggle('border-green-500', isDone)
  updateCounts()
  saveToStorage()
}

function updateCounts() {
  days.forEach((_, idx) => {
    const list = document.getElementById(`list-${idx}`)
    if (!list) return
    const t = list.querySelectorAll('.exercise-card').length
    const d = list.querySelectorAll('.exercise-card.completed').length
    document.getElementById(`prog-${idx}`).innerText = `${d}/${t}`
    document
      .getElementById(`badge-${idx}`)
      .classList.toggle('hidden', t === 0 || d !== t)
  })
}

function showMotivation() {
  ;['configHeader', 'configBody', 'configFooter'].forEach((id) =>
    document.getElementById(id).classList.add('hidden')
  )
  document.getElementById('motivationBody').classList.remove('hidden')
  lucide.createIcons()
}

function finishProcess() {
  toggleConfig()
  finishImportUI()
  setTimeout(() => {
    ;['configHeader', 'configBody', 'configFooter'].forEach((id) =>
      document.getElementById(id).classList.remove('hidden')
    )
    document.getElementById('motivationBody').classList.add('hidden')
  }, 500)
}

function editCard(btn) {
  editingTarget = btn.closest('.exercise-card')
  document.getElementById('editName').value =
    editingTarget.querySelector('.ex-name').innerText
  document.getElementById('editReps').value =
    editingTarget.querySelector('.ex-reps').innerText
  document.getElementById('modalEdit').classList.remove('hidden')
}

function saveEdit() {
  editingTarget.querySelector('.ex-name').innerText =
    document.getElementById('editName').value
  editingTarget.querySelector('.ex-reps').innerText =
    document.getElementById('editReps').value
  document.getElementById('modalEdit').classList.add('hidden')
  saveToStorage()
}

function exportPlan(format) {
  const columns = Array.from(document.querySelectorAll('.kanban-column'))
  const data = columns.map((col) => ({
    day: col.querySelector('h3').innerText,
    exercises: Array.from(col.querySelectorAll('.exercise-card')).map(
      (card) => ({
        name: card.querySelector('.ex-name').innerText,
        reps: card.querySelector('.ex-reps').innerText
      })
    )
  }))
  let blob, fn
  if (format === 'json') {
    blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    fn = 'plan.json'
  } else {
    let csv = 'Dia,Ejercicio,Reps\n'
    data.forEach((d) =>
      d.exercises.forEach(
        (e) => (csv += `"${d.day}","${e.name}","${e.reps}"\n`)
      )
    )
    blob = new Blob([csv], { type: 'text/csv' })
    fn = 'plan.csv'
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = fn
  a.click()
}

function fixDayOrder() {
  document.querySelectorAll('.kanban-column').forEach((col, i) => {
    col.querySelector('h3').innerText = days[i]
    col.querySelector('[id^="prog-"]').id = `prog-${i}`
    col.querySelector('[id^="list-"]').id = `list-${i}`
    col.querySelector('[id^="badge-"]').id = `badge-${i}`
  })
}
window.onload = init

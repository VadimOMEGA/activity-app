/**
 * AI3 Admin Dashboard — Client-side JS
 * Handles: fetch API calls, toast notifications, modal helpers, sidebar toggle
 */

// ============================================
// API Helper
// ============================================

let refreshPromise = null

function getCookie(name) {
	const value = `; ${document.cookie}`
	const parts = value.split(`; ${name}=`)
	if (parts.length === 2) return parts.pop().split(';').shift()
}

async function refreshAccessToken() {
	// If already refreshing → reuse same promise
	if (refreshPromise) return refreshPromise

	refreshPromise = (async () => {
		try {
			const res = await fetch('/api/auth/login/refresh', {
				method: 'POST',
				credentials: 'include'
			})

			if (!res.ok) throw new Error('Refresh failed')

			const data = await res.json()

			document.cookie = `accessToken=${data.accessToken}; path=/; SameSite=Lax`

			return data.accessToken
		} finally {
			// reset after completion (success OR fail)
			refreshPromise = null
		}
	})()

	return refreshPromise
}

async function apiCall(url, method = 'GET', body = null, _retry = false) {
	const token = getCookie('accessToken')

	const options = {
		method,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {})
		},
		credentials: 'include'
	}

	if (body && method !== 'GET') {
		options.body = JSON.stringify(body)
	}

	const res = await fetch(url, options)

	if (res.status === 401 && !_retry && !url.includes('/api/auth/')) {
		await refreshAccessToken()
		return apiCall(url, method, body, true)
	}

	const data = await res.json().catch(() => null)

	if (!res.ok) {
		throw new Error(
			Array.isArray(data?.message)
				? data.message.join(', ')
				: data?.message || `Request failed with status ${res.status}`
		)
	}

	return data
}

// ============================================
// Toast Notifications
// ============================================

function showToast(message, type = 'success') {
	const container = document.getElementById('toast-container')
	if (!container) return

	const id = 'toast-' + Date.now()
	const bgClass =
		type === 'success' ? 'text-bg-success' : type === 'error' ? 'text-bg-danger' : 'text-bg-info'
	const icon =
		type === 'success'
			? 'bi-check-circle-fill'
			: type === 'error'
				? 'bi-exclamation-triangle-fill'
				: 'bi-info-circle-fill'

	const toastHTML = `
		<div id="${id}" class="toast align-items-center ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
			<div class="d-flex">
				<div class="toast-body">
					<i class="bi ${icon} me-2"></i>${escapeHtml(message)}
				</div>
				<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
			</div>
		</div>
	`

	container.insertAdjacentHTML('beforeend', toastHTML)
	const toastEl = document.getElementById(id)
	const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 })
	bsToast.show()

	toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove())
}

// ============================================
// Modal Helpers
// ============================================

function showModalLoader(modalEl, text = 'Loading...') {
	let overlay = modalEl.querySelector('.modal-loader-overlay')
	if (!overlay) {
		overlay = document.createElement('div')
		overlay.className = 'modal-loader-overlay'
		overlay.innerHTML = `
			<div class="spinner-border" role="status">
				<span class="visually-hidden">Loading...</span>
			</div>
			<span class="loader-text">${escapeHtml(text)}</span>
		`
		const content = modalEl.querySelector('.modal-content')
		if (content) {
			content.style.position = 'relative'
			content.appendChild(overlay)
		}
	} else {
		overlay.querySelector('.loader-text').textContent = text
		overlay.style.display = 'flex'
	}
}

function hideModalLoader(modalEl) {
	const overlay = modalEl.querySelector('.modal-loader-overlay')
	if (overlay) overlay.remove()
}

function updateLoaderText(modalEl, text) {
	const loader = modalEl.querySelector('.loader-text')
	if (loader) loader.textContent = text
}

// ============================================
// Confirm Delete
// ============================================

let pendingDeleteCallback = null

function confirmDelete(entityName, callback) {
	pendingDeleteCallback = callback
	const modal = document.getElementById('confirmDeleteModal')
	if (!modal) return

	const nameEl = modal.querySelector('.entity-name')
	if (nameEl) nameEl.textContent = entityName

	const bsModal = new bootstrap.Modal(modal)
	bsModal.show()
}

document.addEventListener('DOMContentLoaded', () => {
	const confirmBtn = document.getElementById('confirmDeleteBtn')
	if (confirmBtn) {
		confirmBtn.addEventListener('click', async () => {
			if (pendingDeleteCallback) {
				try {
					await pendingDeleteCallback()
					showToast('Deleted successfully')
				} catch (err) {
					showToast(err.message || 'Delete failed', 'error')
				}
				pendingDeleteCallback = null
				const modal = bootstrap.Modal.getInstance(
					document.getElementById('confirmDeleteModal')
				)
				if (modal) modal.hide()
			}
		})
	}
})

// ============================================
// Sidebar Toggle (responsive)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
	const toggleBtn = document.querySelector('.sidebar-toggle')
	const sidebar = document.querySelector('.admin-sidebar')
	const backdrop = document.querySelector('.sidebar-backdrop')

	if (toggleBtn && sidebar) {
		toggleBtn.addEventListener('click', () => {
			sidebar.classList.toggle('show')
			if (backdrop) backdrop.classList.toggle('show')
		})

		if (backdrop) {
			backdrop.addEventListener('click', () => {
				sidebar.classList.remove('show')
				backdrop.classList.remove('show')
			})
		}
	}
})

// ============================================
// Utility
// ============================================

function escapeHtml(str) {
	const div = document.createElement('div')
	div.appendChild(document.createTextNode(str))
	return div.innerHTML
}

function formatDate(dateString) {
	if (!dateString) return '—'
	const d = new Date(dateString)
	return d.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	})
}

function formatDateTime(dateString) {
	if (!dateString) return '—'
	const d = new Date(dateString)
	return d.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
}

function reloadPage() {
	window.location.reload()
}

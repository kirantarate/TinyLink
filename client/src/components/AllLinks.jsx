import React, { useState, useEffect } from 'react'
import { getAllLinks, deleteLink, getByCode, incrementCount } from '../api/userApi'


function AllLinks({ onNavigateToCreate }) {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [viewingLink, setViewingLink] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewError, setViewError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const recordsPerPage = 10

  useEffect(() => {
    fetchLinks(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const fetchLinks = async (page = 1) => {
    try {
      setLoading(true)
      // Calculate start and limit: 
      // Page 1: start=0, limit=9
      // Page 2: start=10, limit=19
      // Page 3: start=20, limit=29
      const start = (page - 1) * recordsPerPage
      const limit = start + (recordsPerPage - 1)
      console.log(`Fetching page ${page}, start=${start}, limit=${limit}`)
      const response = await getAllLinks(start, limit)
      console.log('API Response:', response)

      // Handle API response structure: { success, status, data: [], pagination: {} }
      if (response && response.success && Array.isArray(response.data)) {
        setLinks(response.data)

        // Use pagination info from response
        if (response.pagination) {
          setTotalRecords(response.pagination.total || response.data.length)
          setTotalPages(response.pagination.totalPages || 1)
          // Don't sync page from response to avoid overriding user's page change
        } else {
          setTotalRecords(response.data.length)
          setTotalPages(Math.ceil(response.data.length / recordsPerPage))
        }
      } else if (Array.isArray(response)) {
        // Fallback: if response is directly an array
        setLinks(response)
        setTotalRecords(response.length)
        setTotalPages(Math.ceil(response.length / recordsPerPage))
      } else {
        setLinks([])
        setTotalRecords(0)
        setTotalPages(1)
      }
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch links. Please try again.')
      setLinks([])
      setTotalRecords(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (code) => {
    try {
      await deleteLink(code)
      setDeleteConfirmId(null)
      fetchLinks(currentPage)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete link. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const getShortUrl = (code) => {
    return `${window.location.origin}/${code}`
  }

  const handleTargetUrlClick = async (e, code) => {
    try {
      await incrementCount(code)
      // Refresh the links to update click count
      fetchLinks(currentPage)
    } catch (err) {
      console.error('Failed to increment count:', err)
      // Still allow the link to open even if API call fails
    }
  }

  const handleView = async (link) => {
    setViewLoading(true)
    setViewError(null)
    setViewingLink(null)

    try {
      const response = await getByCode(link.code)
      setViewingLink(response)
    } catch (err) {
      setViewError(err.response?.data?.message || 'Failed to fetch link details. Please try again.')
    } finally {
      setViewLoading(false)
    }
  }

  const closeViewModal = () => {
    setViewingLink(null)
    setViewError(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-purple-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400">Loading links...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">

            <h1 className="text-3xl font-bold text-purple-500">All Links</h1>
          </div>

          <div className='flex flex-row gap-4'>
            <button
              onClick={onNavigateToCreate}
              className="px-4 py-2 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Link
            </button>
            <button
              onClick={() => fetchLinks(currentPage)}
              className="px-4 py-2 bg-purple-600 cursor-pointer hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {links.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl p-12 text-center">
            <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p className="text-slate-400 text-lg">No links found. Create your first short link!</p>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Serial</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Code</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Target URL</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Clicks</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Last Clicked</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Created At</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {links.map((link, index) => (
                    <tr key={link.id} className="hover:bg-slate-750 transition-colors">
                      <td className="px-6 py-4 text-slate-300">{(currentPage - 1) * recordsPerPage + index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400 font-mono font-semibold">{link.code}</span>
                          <button
                            onClick={() => copyToClipboard(link.code)}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Copy code"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <a
                          href={link.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => handleTargetUrlClick(e, link.code)}
                          className="max-w-xs truncate text-blue-400 hover:text-blue-300 text-sm underline cursor-pointer block"
                          title={link.target_url}
                        >
                          {link.target_url}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-300">{link.total_clicks}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{formatDate(link.last_clicked)}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{formatDate(link.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleView(link)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                            title="View"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {deleteConfirmId === link.code ? (
                            <>
                              <button
                                onClick={() => handleDelete(link.code)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                                title="Confirm Delete"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded transition-colors"
                                title="Cancel"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(link.code)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages >= 1 && totalRecords > 0 && (
              <div className="px-6 py-4 bg-slate-700 flex items-center justify-between border-t border-slate-600">
                <div className="text-sm text-slate-400">
                  Showing {((currentPage - 1) * recordsPerPage) + 1} to {Math.min(currentPage * recordsPerPage, totalRecords)} of {totalRecords} links
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded-lg transition-colors ${currentPage === page
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-600 hover:bg-slate-500 text-white'
                              }`}
                          >
                            {page}
                          </button>
                        )
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 text-slate-400">
                            ...
                          </span>
                        )
                      }
                      return null
                    })}
                  </div>

                  <button
                    onClick={() => {
                      if (currentPage < totalPages) {
                        const nextPage = currentPage + 1
                        console.log(`Next clicked: Moving from page ${currentPage} to page ${nextPage}`)
                        setCurrentPage(nextPage)
                      }
                    }}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-1"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View Modal */}
        {(viewingLink || viewLoading || viewError) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-purple-500">Link Details</h2>
              </div>

              {viewLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-purple-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-slate-400">Loading link details...</p>
                  </div>
                </div>
              )}

              {viewError && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
                  {viewError}
                </div>
              )}

              {viewingLink && !viewLoading && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-400">ID</label>
                    <p className="text-white mt-1">{viewingLink.id}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-400">Code</label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-purple-400 font-mono font-semibold">{viewingLink.code}</p>
                      <button
                        onClick={() => copyToClipboard(viewingLink.code)}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Copy code"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-400">Short URL</label>
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={getShortUrl(viewingLink.code)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-mono text-sm break-all"
                      >
                        {getShortUrl(viewingLink.code)}
                      </a>
                      <button
                        onClick={() => copyToClipboard(getShortUrl(viewingLink.code))}
                        className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                        title="Copy short URL"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-400">Target URL</label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-white text-sm break-all">{viewingLink.target_url}</p>
                      <button
                        onClick={() => copyToClipboard(viewingLink.target_url)}
                        className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                        title="Copy target URL"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-400">Total Clicks</label>
                      <p className="text-white mt-1 text-lg font-semibold">{viewingLink.total_clicks}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-400">Last Clicked</label>
                      <p className="text-white mt-1">{formatDate(viewingLink.last_clicked)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-400">Created At</label>
                    <p className="text-white mt-1">{formatDate(viewingLink.created_at)}</p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AllLinks

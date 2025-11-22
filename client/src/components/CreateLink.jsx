import React, { useState } from 'react'
import { createLink } from '../api/userApi'

function CreateLink({ onNavigateToAllLinks }) {
    const [longUrl, setLongUrl] = useState('')
    const [customCode, setCustomCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setLoading(true)

        try {
            const payload = {}
            if (longUrl.trim()) {
                payload.target_url = longUrl.trim()
            }
            if (customCode.trim()) {
                // Validate code is exactly 6 alphanumeric characters
                if (customCode.trim().length !== 6 || !/^[a-zA-Z0-9]{6}$/.test(customCode.trim())) {
                    setError('Custom code must be exactly 6 alphanumeric characters (letters and digits only)')
                    setLoading(false)
                    return
                }
                payload.code = customCode.trim()
            }

            const response = await createLink(payload)
            console.log('Link created:', response)
            setSuccess('Short link created successfully!')
            setLongUrl('')
            setCustomCode('')
            
            // Navigate to AllLinks after a short delay to show success message
            setTimeout(() => {
                if (onNavigateToAllLinks) {
                    onNavigateToAllLinks()
                }
            }, 1500)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create short link. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-6">
                <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <h1 className="text-2xl font-bold text-purple-500">URL Shortener</h1>
                </div>
                <button 
                    onClick={onNavigateToAllLinks}
                    className="text-white hover:text-purple-400 transition-colors"
                >
                    Dashboard
                </button>
            </header>

            {/* Main Content */}
            <main className="px-8 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={onNavigateToAllLinks}
                        className="mb-6 flex items-center cursor-pointer gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to All Links</span>
                    </button>

                    {/* Title Section */}
                    <div className="text-center mb-6">
                        <h2 className="text-4xl font-bold mb-4">URL Shortener Dashboard</h2>
                        <p className="text-slate-400 text-lg">Create and manage your short links with ease</p>
                    </div>

                    {/* Create Link Card */}
                    <div className="bg-slate-800 rounded-2xl p-8 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative">
                                <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <svg className="w-4 h-4 text-orange-500 absolute -top-1 -right-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold">Create New Short Link</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {/* Success Message */}
                            {success && (
                                <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
                                    {success}
                                </div>
                            )}

                            {/* Long URL Input */}
                            <div>
                                <label htmlFor="longUrl" className="block text-sm font-medium mb-2">
                                    Long URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    id="longUrl"
                                    value={longUrl}
                                    onChange={(e) => setLongUrl(e.target.value)}
                                    placeholder="https://example.com/very/long/url"
                                    required
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* Custom Code Input */}
                            <div>
                                <label htmlFor="customCode" className="block text-sm font-medium mb-2">
                                    Custom Code (optional)
                                </label>
                                <input
                                    type="text"
                                    id="customCode"
                                    value={customCode}
                                    onChange={(e) => {
                                        const value = e.target.value
                                        // Only allow alphanumeric characters and limit to 6 characters
                                        if (value === '' || /^[a-zA-Z0-9]{0,6}$/.test(value)) {
                                            setCustomCode(value)
                                        }
                                    }}
                                    placeholder="6 alphanumeric characters"
                                    pattern="[a-zA-Z0-9]{6}"
                                    maxLength={6}
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <p className="mt-2 text-sm text-slate-400 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    Exactly 6 alphanumeric characters (letters and digits)
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                        </svg>
                                        Create Short Link
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default CreateLink

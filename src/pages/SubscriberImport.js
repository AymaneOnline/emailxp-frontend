import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Upload, Download, FileText, CheckCircle } from 'lucide-react';
import subscriberService from '../services/subscriberService';
import devLog from '../utils/devLog';
import groupService from '../services/groupService';

const SubscriberImport = () => {
    const navigate = useNavigate();
    
    // State
    const [groups, setGroups] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [csvData, setCsvData] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [importResults, setImportResults] = useState(null);
    const [overwriteExisting, setOverwriteExisting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Results
    // tags selection not used yet

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        try {
            const fetchedGroups = await groupService.getGroups();
            setGroups(fetchedGroups);
        } catch (error) {
            console.error('Failed to load groups:', error);
            // Don't show error toast as groups are optional
            setGroups([]);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            toast.error('Please select a CSV file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('File size must be less than 5MB');
            return;
        }

        // File selected and validated
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                const parsed = subscriberService.parseCSV(csvText);
                setCsvData(parsed);
                setPreviewData(parsed.subscribers.slice(0, 10)); // Preview first 10
                setStep(2);
            } catch (error) {
                toast.error(error.message);
            }
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (!csvData) return;

        setLoading(true);
        try {
            // Collect all tags from CSV data
            const allTags = new Set();
            csvData.subscribers.forEach(subscriber => {
                if (subscriber.tags) {
                    subscriber.tags.forEach(tag => allTags.add(tag));
                }
            });
            devLog('All tags from CSV:', Array.from(allTags));

            const importData = {
                subscribers: csvData.subscribers,
                overwriteExisting,
                groupIds: selectedGroups,
                tagNames: Array.from(allTags) // Send tag names instead of IDs
            };
            
            const results = await subscriberService.bulkImportSubscribers(importData);
            setImportResults(results);
            setStep(3);
            
            if (results.errors.length === 0) {
                toast.success(`Successfully imported ${results.imported} subscribers`);
            } else {
                toast.warning(`Imported ${results.imported} subscribers with ${results.errors.length} errors`);
            }
        } catch (error) {
            console.error('Import failed:', error);
            toast.error('Import failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const template = 'Email,First Name,Last Name,Status,Tags,Groups\nexample@email.com,John,Doe,subscribed,"tag1;tag2","group1;group2"';
        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'subscriber_template.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const resetImport = () => {
        setCsvData(null);
        setPreviewData(null);
        setImportResults(null);
        setStep(1);
    };

    // Removed the groups.length === 0 check to allow importing without groups

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/subscribers')}
                    className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Subscribers
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Import Subscribers
                </h1>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-center space-x-8">
                    {[
                        { step: 1, label: 'Upload CSV', icon: Upload },
                        { step: 2, label: 'Preview Data', icon: FileText },
                        { step: 3, label: 'Import Results', icon: CheckCircle }
                    ].map(({ step: stepNum, label, icon: Icon }) => (
                        <div key={stepNum} className="flex items-center">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                step >= stepNum 
                                    ? 'bg-red-600 border-red-600 text-white' 
                                    : 'border-gray-300 text-gray-300'
                            }`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className={`ml-2 text-sm font-medium ${
                                step >= stepNum ? 'text-red-600' : 'text-gray-500'
                            }`}>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step 1: Upload CSV */}
            {step === 1 && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Select Group and Upload CSV
                        </h2>
                        
                        {/* Group Selection - Optional */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Add to Groups (Optional)
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                You can assign subscribers to groups now or later from the subscriber management page.
                            </p>
                            {groups.length > 0 ? (
                                <div className="space-y-2">
                                    {groups.map(group => (
                                        <label key={group._id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedGroups.includes(group._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedGroups([...selectedGroups, group._id]);
                                                    } else {
                                                        setSelectedGroups(selectedGroups.filter(id => id !== group._id));
                                                    }
                                                }}
                                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">{group.name}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No groups created yet. You can create groups later and assign subscribers to them.
                                </p>
                            )}
                        </div>

                        {/* File Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                CSV File
                            </label>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <div className="space-y-2">
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Drop your CSV file here or click to browse
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500">
                                        Maximum file size: 5MB
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                                />
                            </div>
                        </div>

                        {/* Template Download */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-start">
                                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Need a template?
                                    </h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                        Download our CSV template to ensure proper formatting.
                                    </p>
                                    <button
                                        onClick={downloadTemplate}
                                        className="inline-flex items-center mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                                    >
                                        <Download className="w-4 h-4 mr-1" />
                                        Download Template
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Preview Data */}
            {step === 2 && csvData && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Preview Import Data
                        </h2>
                        
                        {/* Import Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                                    {csvData.subscribers.length}
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400">
                                    Subscribers to import
                                </div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                                    {csvData.errors.length}
                                </div>
                                <div className="text-sm text-red-600 dark:text-red-400">
                                    Parsing errors
                                </div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                                    Import Options
                                </div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={overwriteExisting}
                                        onChange={(e) => setOverwriteExisting(e.target.checked)}
                                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="ml-2 text-sm text-blue-700 dark:text-blue-300">
                                        Overwrite existing subscribers
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Preview Table */}
                        {previewData.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                                    Preview (First 10 rows)
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Tags
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Groups
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {previewData.map((subscriber, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {subscriber.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {`${subscriber.firstName} ${subscriber.lastName}`.trim() || 'No Name'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                            {subscriber.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {subscriber.tags.join(', ') || 'None'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {subscriber.groups.join(', ') || 'None'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Parsing Errors */}
                        {csvData.errors.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-md font-medium text-red-800 dark:text-red-200 mb-2">
                                    Parsing Errors
                                </h3>
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-h-40 overflow-y-auto">
                                    {csvData.errors.map((error, index) => (
                                        <div key={index} className="text-sm text-red-700 dark:text-red-300">
                                            Row {error.row}: {error.error}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-between">
                            <button
                                onClick={resetImport}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Start Over
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={loading || csvData.subscribers.length === 0}
                                className="inline-flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                )}
                                Import Subscribers
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Import Results */}
            {step === 3 && importResults && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Import Results
                        </h2>
                        
                        {/* Results Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                    {importResults.total}
                                </div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">
                                    Total processed
                                </div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                                    {importResults.imported}
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400">
                                    Imported
                                </div>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                                    {importResults.updated}
                                </div>
                                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                                    Updated
                                </div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                                    {importResults.errors.length}
                                </div>
                                <div className="text-sm text-red-600 dark:text-red-400">
                                    Errors
                                </div>
                            </div>
                        </div>

                        {/* Import Errors */}
                        {importResults.errors.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-md font-medium text-red-800 dark:text-red-200 mb-2">
                                    Import Errors
                                </h3>
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-h-40 overflow-y-auto">
                                    {importResults.errors.map((error, index) => (
                                        <div key={index} className="text-sm text-red-700 dark:text-red-300">
                                            Row {error.row}: {error.error}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-between">
                            <button
                                onClick={resetImport}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Import More
                            </button>
                            <button
                                onClick={() => navigate('/subscribers')}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                View Subscribers
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriberImport;

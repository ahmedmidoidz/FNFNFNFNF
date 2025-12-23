
import React from 'react';
import { useLanguage } from './LanguageContext';
import { FileTextIcon, PrinterIcon } from './Icons';

interface ReportsProps {
  onExport: () => void;
}

const Reports: React.FC<ReportsProps> = ({ onExport }) => {
  const { t } = useLanguage();
  
  const handlePrint = () => {
      window.print();
  };

  const pastReports = [
    { id: 1, name: 'October 2023', date: '2023-10-31' },
    { id: 2, name: 'September 2023', date: '2023-09-30' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 pb-20 max-w-5xl mx-auto">
      <header className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('reports.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('reports.subtitle')}</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-lg hover:bg-slate-200 transition text-sm font-medium shadow-sm"
            >
                <PrinterIcon className="w-4 h-4" />
                Print
            </button>
            <button 
                onClick={onExport}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
            >
                <FileTextIcon className="w-4 h-4" />
                {t('reports.generate')}
            </button>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden print:shadow-none print:border-none">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
          <h3 className="font-bold text-slate-700 dark:text-white">{t('reports.monthlySummary')}</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {pastReports.map(report => (
            <div key={report.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition print:break-inside-avoid">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <FileTextIcon className="w-5 h-5" />
                  </div>
                  <div>
                      <h4 className="font-semibold text-slate-800 dark:text-white text-sm">{report.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('reports.generatedOn')} {report.date}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 print:hidden">
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">CSV</span>
                  <button onClick={onExport} className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                      {t('reports.download')}
                  </button>
               </div>
            </div>
          ))}
          <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition bg-emerald-50/50 dark:bg-emerald-900/10">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <FileTextIcon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white text-sm">{t('dashboard.incomeMonth')}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('reports.generatedOn')} {new Date().toLocaleDateString()}</p>
                </div>
             </div>
             <div className="flex items-center gap-4 print:hidden">
                <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">CSV</span>
                <button onClick={onExport} className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                    {t('reports.download')}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;


import React from 'react';
import { Transaction } from '../types';
import { useLanguage } from './LanguageContext';
import { ReceiptIcon } from './Icons';
import InfoTag from './InfoTag';

interface ReceiptsProps {
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
}

const Receipts: React.FC<ReceiptsProps> = ({ transactions, formatCurrency }) => {
    const { t } = useLanguage();
    const receipts = transactions.filter(t => t.receiptImage);

    return (
        <div className="p-6 md:p-8 space-y-6 pb-20">
            <header>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-1">
                    {t('receipts.title')}
                    <InfoTag title={t('receipts.title')} description={t('help.receipts')} />
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t('receipts.subtitle')}</p>
            </header>

            {receipts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <ReceiptIcon className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p>{t('receipts.noReceipts')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {receipts.map(t => (
                        <div key={t.id} className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square">
                            <img src={t.receiptImage} alt="Receipt" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <p className="text-white font-bold text-sm truncate">{t.merchant}</p>
                                <p className="text-white/80 text-xs dir-ltr">{formatCurrency(t.amount)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Receipts;

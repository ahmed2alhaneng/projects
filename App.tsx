
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Cpu, 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Terminal as TerminalIcon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  Unlock,
  Info
} from 'lucide-react';
import { DeviceStatus, DeviceInfo, LogEntry } from './types';
import { analyzeDeviceIssue } from './services/geminiService';

// --- Components ---

const Header: React.FC = () => (
  <header className="w-full py-6 px-8 flex justify-between items-center glass-effect sticky top-0 z-50">
    <div className="flex flex-col">
      <h1 className="text-3xl font-extrabold text-teal-400 tracking-tight">
        مكتب كلاسيك فون
      </h1>
      <p className="text-teal-200/60 text-sm font-medium">Classic Phone Office</p>
    </div>
    <div className="text-right flex flex-col items-end">
      <div className="flex items-center gap-2 text-teal-400">
        <ShieldCheck size={20} />
        <span className="font-bold text-lg">أحمد النعيمي</span>
      </div>
      <span className="text-xs text-teal-500/50 uppercase tracking-widest">Master Technician</span>
    </div>
  </header>
);

const Sidebar: React.FC<{ activeTab: string; setTab: (t: string) => void }> = ({ activeTab, setTab }) => {
  const tabs = [
    { id: 'dashboard', icon: Smartphone, label: 'لوحة التحكم' },
    { id: 'tools', icon: Zap, label: 'أدوات التخطي' },
    { id: 'logs', icon: TerminalIcon, label: 'السجلات' },
    { id: 'help', icon: Info, label: 'المساعدة' },
  ];

  return (
    <aside className="w-64 glass-effect min-h-screen hidden md:flex flex-col p-4 gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setTab(tab.id)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            activeTab === tab.id 
            ? 'bg-teal-500/20 text-teal-400 border-r-4 border-teal-500' 
            : 'text-gray-400 hover:bg-teal-500/10 hover:text-teal-300'
          }`}
        >
          <tab.icon size={20} />
          <span className="font-medium">{tab.label}</span>
        </button>
      ))}
      <div className="mt-auto p-4 bg-teal-900/20 rounded-2xl border border-teal-500/20">
        <p className="text-xs text-teal-400/70 mb-2">حالة النظام</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-green-400 font-bold">متصل بالسيرفر</span>
        </div>
      </div>
    </aside>
  );
};

const DevicePanel: React.FC<{ info: DeviceInfo | null; status: DeviceStatus }> = ({ info, status }) => {
  return (
    <div className="glass-effect rounded-3xl p-6 turquoise-glow border border-teal-500/30 flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-teal-100 flex items-center gap-2">
          <Smartphone className="text-teal-400" /> معلومات الجهاز
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
          status === DeviceStatus.CONNECTED ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          status === DeviceStatus.BYPASSING ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
        }`}>
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-teal-500/10">
          <p className="text-xs text-teal-400/50 mb-1">الموديل</p>
          <p className="font-mono text-lg">{info?.model || '---'}</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-teal-500/10">
          <p className="text-xs text-teal-400/50 mb-1">إصدار iOS</p>
          <p className="font-mono text-lg">{info?.version || '---'}</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-teal-500/10">
          <p className="text-xs text-teal-400/50 mb-1">الرقم التسلسلي</p>
          <p className="font-mono text-lg">{info?.serial || '---'}</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-teal-500/10">
          <p className="text-xs text-teal-400/50 mb-1">IMEI</p>
          <p className="font-mono text-lg">{info?.imei || '---'}</p>
        </div>
      </div>

      {status === DeviceStatus.IDLE && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-4">
          <Smartphone size={48} className="opacity-20" />
          <p>قم بتوصيل الجهاز لبدء العملية</p>
        </div>
      )}
    </div>
  );
};

const BypassActions: React.FC<{ 
  onAction: (action: string) => void; 
  status: DeviceStatus 
}> = ({ onAction, status }) => {
  const actions = [
    { id: 'hello', name: 'تخطى شاشة الترحيب (Hello Screen)', desc: 'دعم كامل للإشعارات و iCloud', icon: Unlock },
    { id: 'passcode', name: 'تخطى رمز القفل (Passcode)', desc: 'بدون فقدان الشبكة', icon: Lock },
    { id: 'mdm', name: 'تخطى إدارة الأجهزة (MDM)', desc: 'إزالة ملفات التعريف المؤسسية', icon: ShieldCheck },
    { id: 'ramdisk', name: 'تمهيد Ramdisk', desc: 'للعمليات المتقدمة والإصلاح', icon: Cpu },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {actions.map((act) => (
        <button
          key={act.id}
          disabled={status !== DeviceStatus.CONNECTED}
          onClick={() => onAction(act.id)}
          className={`flex items-start gap-4 p-5 rounded-3xl transition-all duration-300 text-right group ${
            status === DeviceStatus.CONNECTED
            ? 'bg-teal-500/5 hover:bg-teal-500/20 border border-teal-500/20 hover:border-teal-400'
            : 'bg-gray-500/5 border border-gray-500/10 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="bg-teal-500/10 p-3 rounded-2xl group-hover:scale-110 transition-transform">
            <act.icon className="text-teal-400" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-teal-100 group-hover:text-teal-400 transition-colors">{act.name}</h4>
            <p className="text-sm text-teal-100/50">{act.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

const Console: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-950 rounded-3xl p-6 border border-teal-500/20 font-mono text-sm h-64 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-teal-500/10">
        <div className="flex items-center gap-2 text-teal-500">
          <TerminalIcon size={16} />
          <span>سجل العمليات</span>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
        {logs.map((log, idx) => (
          <div key={idx} className="flex gap-2">
            <span className="text-teal-500/40">[{log.timestamp}]</span>
            <span className={
              log.type === 'success' ? 'text-green-400' :
              log.type === 'error' ? 'text-red-400' :
              log.type === 'warning' ? 'text-yellow-400' :
              'text-blue-300'
            }>
              {log.message}
            </span>
          </div>
        ))}
        {logs.length === 0 && <p className="text-gray-600">بانتظار العمليات...</p>}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [status, setStatus] = useState<DeviceStatus>(DeviceStatus.IDLE);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const [geminiAnalysis, setGeminiAnalysis] = useState<string | null>(null);

  const addLog = useCallback((message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString('ar-EG', { hour12: false });
    setLogs(prev => [...prev, { timestamp, message, type }]);
  }, []);

  const simulateConnect = () => {
    setStatus(DeviceStatus.CONNECTING);
    addLog('جاري البحث عن أجهزة متصلة...', 'info');
    
    setTimeout(() => {
      const mockDevice: DeviceInfo = {
        model: 'iPhone 13 Pro Max',
        version: '17.4.1',
        serial: 'G76V9R0X0NQ',
        imei: '358941002938475',
        status: 'Locked'
      };
      setDeviceInfo(mockDevice);
      setStatus(DeviceStatus.CONNECTED);
      addLog('تم العثور على جهاز: iPhone 13 Pro Max', 'success');
      addLog('تم الاتصال بنجاح. الإصدار متوافق مع ثغرة Kernel.', 'info');
      
      // Fetch analysis from Gemini
      analyzeDeviceIssue(mockDevice.model, mockDevice.version).then(setGeminiAnalysis);
    }, 2000);
  };

  const startBypass = (type: string) => {
    setStatus(DeviceStatus.BYPASSING);
    setProgress(0);
    addLog(`بدء عملية التخطي: ${type}...`, 'warning');

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus(DeviceStatus.SUCCESS);
          addLog('اكتملت العملية بنجاح! الجهاز سيقوم بإعادة التشغيل.', 'success');
          return 100;
        }
        
        const next = prev + 5;
        if (next === 20) addLog('جاري استغلال الثغرة...', 'info');
        if (next === 50) addLog('جاري حقن ملفات النظام...', 'info');
        if (next === 80) addLog('جاري تفعيل الحساب الوهمي...', 'info');
        
        return next;
      });
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setTab={setActiveTab} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          
          {/* Welcome Section */}
          <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 bg-gradient-to-br from-teal-600 to-teal-900 border border-teal-400/30">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap size={200} />
            </div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                أداة كلاسيك برو للتخطي الشامل
              </h2>
              <p className="text-teal-50 text-lg mb-8 opacity-80 leading-relaxed">
                الحل الأسرع والأكثر أماناً لتخطي جميع إصدارات أبل. دعم حصري من فريق كلاسيك فون وتحت إشراف أحمد النعيمي.
              </p>
              {status === DeviceStatus.IDLE && (
                <button 
                  onClick={simulateConnect}
                  className="bg-white text-teal-900 font-bold px-8 py-4 rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-teal-500/20"
                >
                  <RefreshCw size={24} className={status === DeviceStatus.CONNECTING ? 'animate-spin' : ''} />
                  افحص الجهاز الآن
                </button>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Device Info & Actions */}
            <div className="lg:col-span-8 space-y-8">
              
              {status === DeviceStatus.BYPASSING && (
                <div className="glass-effect p-8 rounded-[2rem] border-teal-500/50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-teal-400">جاري المعالجة...</h3>
                    <span className="text-2xl font-mono">{progress}%</span>
                  </div>
                  <div className="w-full h-4 bg-teal-950 rounded-full overflow-hidden border border-teal-500/20">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <BypassActions onAction={startBypass} status={status} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-effect p-6 rounded-3xl flex flex-col items-center gap-2">
                  <Activity className="text-teal-400" />
                  <p className="text-xs text-teal-400/50">عمليات اليوم</p>
                  <p className="text-2xl font-bold">128</p>
                </div>
                <div className="glass-effect p-6 rounded-3xl flex flex-col items-center gap-2">
                  <CheckCircle2 className="text-green-400" />
                  <p className="text-xs text-teal-400/50">نسبة النجاح</p>
                  <p className="text-2xl font-bold">99.8%</p>
                </div>
                <div className="glass-effect p-6 rounded-3xl flex flex-col items-center gap-2">
                  <Zap className="text-yellow-400" />
                  <p className="text-xs text-teal-400/50">متوسط الوقت</p>
                  <p className="text-2xl font-bold">3.2m</p>
                </div>
              </div>
            </div>

            {/* Right Column: Console & Status */}
            <div className="lg:col-span-4 space-y-8">
              <DevicePanel info={deviceInfo} status={status} />
              
              {geminiAnalysis && (
                <div className="glass-effect p-6 rounded-3xl border-blue-500/20 bg-blue-500/5">
                  <h4 className="flex items-center gap-2 text-blue-400 font-bold mb-3">
                    <Info size={18} /> تحليل فني ذكي
                  </h4>
                  <p className="text-sm text-blue-100/70 leading-relaxed italic">
                    {geminiAnalysis}
                  </p>
                </div>
              )}

              <Console logs={logs} />
            </div>
          </div>
        </main>
      </div>

      {/* Footer Branding */}
      <footer className="glass-effect py-4 px-8 border-t border-teal-500/10 flex flex-col md:flex-row justify-between items-center text-xs text-teal-500/40">
        <p>© 2024 Classic Phone Pro Dashboard. All Rights Reserved.</p>
        <p className="font-bold text-teal-400/60 mt-2 md:mt-0 tracking-[0.2em]">BY AHMED AL-NUAIMI</p>
      </footer>

      {/* Floating Decorative Elements */}
      <div className="fixed -bottom-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
    </div>
  );
}

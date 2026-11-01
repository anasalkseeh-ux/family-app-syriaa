import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { 
  Users, Wallet, ShoppingBag, ShieldAlert, MessageSquare, Bell, Calendar, Plus, Trash2, 
  Send, RefreshCw, Smartphone, TrendingUp, AlertTriangle, CheckCircle2, UserPlus, Clock, LogOut 
} from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyBh2Mnm_g3bRWq_KwxPUR2RApcpfbYIwDc",
  authDomain: "family-app-syria.firebaseapp.com",
  projectId: "family-app-syria",
  storageBucket: "family-app-syria.firebasestorage.app",
  messagingSenderId: "922487432702",
  appId: "1:922487432702:web:416d79e41b5aceeeab0caf",
  measurementId: "G-NSQVJXYBKL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeFilter, setTimeFilter] = useState('month');
  
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [toBuyList, setToBuyList] = useState([]);
  const [toAvoidList, setToAvoidList] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [totalBudget, setTotalBudget] = useState(15000000);
  
  const [currentUser, setCurrentUser] = useState('أنس');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberLimit, setNewMemberLimit] = useState('');
  
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('فواتير');
  const [expenseMember, setExpenseMember] = useState('أنس');

  const [toBuyItem, setToBuyItem] = useState('');
  const [toAvoidItem, setToAvoidItem] = useState('');
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const unsubMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qExpenses = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubBuy = onSnapshot(collection(db, 'toBuy'), (snapshot) => {
      setToBuyList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubAvoid = onSnapshot(collection(db, 'toAvoid'), (snapshot) => {
      setToAvoidList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qChat = query(collection(db, 'chat'), orderBy('createdAt', 'asc'));
    const unsubChat = onSnapshot(qChat, (snapshot) => {
      setChatMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubMembers();
      unsubExpenses();
      unsubBuy();
      unsubAvoid();
      unsubChat();
    };
  }, []);

  const totalSpent = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const remainingBudget = totalBudget - totalSpent;

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName || !newMemberLimit) return;
    await addDoc(collection(db, 'members'), {
      name: newMemberName,
      limit: Number(newMemberLimit),
      role: 'فرد'
    });
    setNewMemberName('');
    setNewMemberLimit('');
  };

  const handleDeleteMember = async (id) => {
    await deleteDoc(doc(db, 'members', id));
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;
    
    await addDoc(collection(db, 'expenses'), {
      title: expenseTitle,
      amount: Number(expenseAmount),
      category: expenseCategory,
      member: expenseMember,
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    });

    setExpenseTitle('');
    setExpenseAmount('');
  };

  const handleAddToBuy = async (e) => {
    e.preventDefault();
    if (!toBuyItem) return;
    await addDoc(collection(db, 'toBuy'), { title: toBuyItem, status: 'pending' });
    setToBuyItem('');
  };

  const handleAddToAvoid = async (e) => {
    e.preventDefault();
    if (!toAvoidItem) return;
    await addDoc(collection(db, 'toAvoid'), { title: toAvoidItem });
    setToAvoidItem('');
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput) return;
    await addDoc(collection(db, 'chat'), {
      user: currentUser,
      text: chatInput,
      createdAt: serverTimestamp()
    });
    setChatInput('');
  };

  const sendLateNotice = async () => {
    await addDoc(collection(db, 'chat'), {
      user: currentUser,
      text: "⚠️ تنبيه: سأتأخر بالقادمة إلى المنزل اليوم!",
      createdAt: serverTimestamp(),
      isNotice: true
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans dir-rtl" dir="rtl">
      <header className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/40">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                Family - عائلتي
              </h1>
              <p className="text-xs text-slate-400">إدارة المنزل والميزانية الحية</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">الحساب الحالي:</span>
            <select 
              value={currentUser} 
              onChange={(e) => setCurrentUser(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="أنس">أنس (مدير النظام)</option>
              {members.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm font-medium">الميزانية الكلية</span>
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{totalBudget.toLocaleString()} ل.س</div>
            <div className="text-xs text-slate-400 mt-1">محددة شهرياً للعائلة</div>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm font-medium">إجمالي المصاريف</span>
              <TrendingUp className="w-5 h-5 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-400">{totalSpent.toLocaleString()} ل.س</div>
            <div className="text-xs text-slate-400 mt-1">المبلغ المصروف كلياً</div>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm font-medium">المبلغ المتبقي</span>
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
            </div>
            <div className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-red-500' : 'text-teal-400'}`}>
              {remainingBudget.toLocaleString()} ل.س
            </div>
            <div className="text-xs text-slate-400 mt-1">الرصيد المتاح للإنفاق</div>
          </div>
        </div>

        <div className="flex bg-slate-800/60 p-1.5 rounded-xl border border-slate-700/50 overflow-x-auto gap-1">
          {[
            { id: 'dashboard', name: 'المصاريف والتحليل', icon: Wallet },
            { id: 'members', name: 'أفراد العائلة', icon: Users },
            { id: 'lists', name: 'قوائم التخطيط', icon: ShoppingBag },
            { id: 'chat', name: 'الدردشة والتنبيهات', icon: MessageSquare }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                  activeTab === tab.id 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60">
              <h3 className="text-lg font-bold mb-4 text-emerald-400 flex items-center gap-2">
                <Plus className="w-5 h-5" /> إضافة مصروف جديد
              </h3>
              <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <input
                  type="text"
                  placeholder="الوصف (مثلاً: مقاضي البيت)"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  placeholder="المبلغ (ل.س)"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="فواتير">فواتير</option>
                  <option value="مقاضي منزل">مقاضي منزل</option>
                  <option value="طوارئ">طوارئ وصحة</option>
                  <option value="شخصي">مصاريف شخصية</option>
                  <option value="أخرى">أخرى</option>
                </select>
                <select
                  value={expenseMember}
                  onChange={(e) => setExpenseMember(e.target.value)}
                  className="bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="أنس">أنس</option>
                  {members.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-all shadow-md shadow-emerald-500/20"
                >
                  إضافة
                </button>
              </form>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" /> سجل المصاريف والتحليل
                </h3>
                <div className="flex bg-slate-700/50 p-1 rounded-xl border border-slate-600 text-xs">
                  {[
                    { id: 'day', label: 'يومي' },
                    { id: 'week', label: 'أسبوعي' },
                    { id: 'month', label: 'شهري' },
                    { id: 'quarter', label: 'ربع سنوي' },
                    { id: 'half', label: 'نصف سنوي' },
                    { id: 'year', label: 'سنوي' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setTimeFilter(f.id)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        timeFilter === f.id ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm text-slate-300">
                  <thead className="bg-slate-700/40 text-slate-400 text-xs uppercase border-b border-slate-700">
                    <tr>
                      <th className="p-3">الوصف</th>
                      <th className="p-3">المبلغ</th>
                      <th className="p-3">التصنيف</th>
                      <th className="p-3">بواسطة</th>
                      <th className="p-3">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-slate-500">لا توجد مصاريف مسجلة بعد</td>
                      </tr>
                    ) : (
                      expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-700/20 transition-all">
                          <td className="p-3 font-medium text-slate-100">{exp.title}</td>
                          <td className="p-3 text-rose-400 font-semibold">{Number(exp.amount).toLocaleString()} ل.س</td>
                          <td className="p-3">
                            <span className="bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-full border border-slate-600">
                              {exp.category}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{exp.member}</td>
                          <td className="p-3 text-slate-500 text-xs">{exp.date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60">
              <h3 className="text-lg font-bold mb-4 text-emerald-400 flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> إضافة فرد جديد للعائلة
              </h3>
              <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="اسم الفرد (مثلاً: أحمد)"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  placeholder="سقف المصروف الشهري (ل.س)"
                  value={newMemberLimit}
                  onChange={(e) => setNewMemberLimit(e.target.value)}
                  className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-2 text-sm font-semibold transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap"
                >
                  إضافة الفرد
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((m) => {
                const memberSpent = expenses
                  .filter(e => e.member === m.name)
                  .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
                const percent = Math.min(Math.round((memberSpent / m.limit) * 100) || 0, 100);
                const isOver = memberSpent > m.limit;

                return (
                  <div key={m.id} className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-100">{m.name}</h4>
                        <span className="text-xs text-slate-400">سقف المصروف: {m.limit.toLocaleString()} ل.س</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteMember(m.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-400">المصروف الحالي:</span>
                        <span className={isOver ? 'text-rose-400' : 'text-emerald-400'}>
                          {memberSpent.toLocaleString()} ل.س ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${isOver ? 'bg-rose-500' : 'bg-emerald-400'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {isOver && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>تنبيه: تجاوز الفرد سقف المصروف المخصص!</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'lists' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-4">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> قائمة المشتريات (To-Buy)
              </h3>
              <form onSubmit={handleAddToBuy} className="flex gap-2">
                <input
                  type="text"
                  placeholder="أضف غرضاً يجب شراؤه..."
                  value={toBuyItem}
                  onChange={(e) => setToBuyItem(e.target.value)}
                  className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 py-2 text-sm font-semibold">
                  إضافة
                </button>
              </form>
              <ul className="space-y-2">
                {toBuyList.map(item => (
                  <li key={item.id} className="flex justify-between items-center bg-slate-700/30 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-slate-200 text-sm">{item.title}</span>
                    <button onClick={async () => await deleteDoc(doc(db, 'toBuy', item.id))} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-4">
              <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> ما يجب تجنبه (To-Avoid)
              </h3>
              <form onSubmit={handleAddToAvoid} className="flex gap-2">
                <input
                  type="text"
                  placeholder="أضف شيئاً يجب تجنب إنفاق المال عليه..."
                  value={toAvoidItem}
                  onChange={(e) => setToAvoidItem(e.target.value)}
                  className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-500"
                />
                <button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-4 py-2 text-sm font-semibold">
                  تحذير
                </button>
              </form>
              <ul className="space-y-2">
                {toAvoidList.map(item => (
                  <li key={item.id} className="flex justify-between items-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                    <span className="text-rose-200 text-sm">{item.title}</span>
                    <button onClick={async () => await deleteDoc(doc(db, 'toAvoid', item.id))} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-4">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> الدردشة العائلية والتنبيهات
              </h3>
              <button 
                onClick={sendLateNotice}
                className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-500/30 transition-all"
              >
                <Clock className="w-4 h-4" /> تبليغ تأخر عن المنزل
              </button>
            </div>

            <div className="h-80 overflow-y-auto space-y-3 p-2 bg-slate-900/40 rounded-xl border border-slate-700/50">
              {chatMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`p-3 rounded-xl max-w-[80%] ${
                    msg.isNotice 
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200 mx-auto text-center'
                      : msg.user === currentUser 
                        ? 'bg-emerald-600/30 border border-emerald-500/30 mr-auto text-emerald-100' 
                        : 'bg-slate-700/50 border border-slate-600 ml-auto text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-400 mb-1">{msg.user}</div>
                  <div className="text-sm">{msg.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                placeholder="اكتب رسالة أو طلب للعائلة..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2">
                <Send className="w-4 h-4" /> إرسال
              </button>
            </form>
          </div>
        )}
      </main>

      <footer className="bg-slate-800 border-t border-slate-700 p-4 text-center text-xs text-slate-400 fixed bottom-0 w-full z-40">
        تطبيق Family - مصمم ومتزامن لحظياً عبر Firebase لخدمة العائلة والميزانية المنزلية بالليرة السورية
      </footer>
    </div>
  );
}
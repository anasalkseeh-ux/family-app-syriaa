import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, getDocs } from 'firebase/firestore';
import { 
  Users, Wallet, ShoppingBag, ShieldAlert, MessageSquare, Calendar, Plus, Trash2, 
  Send, TrendingUp, AlertTriangle, CheckCircle2, UserPlus, Clock, Lock, LogOut, Key 
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeFilter, setTimeFilter] = useState('month');
  
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [toBuyList, setToBuyList] = useState([]);
  const [toAvoidList, setToAvoidList] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [totalBudget, setTotalBudget] = useState(15000000);
  
  const [currentUser, setCurrentUser] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [newMemberPass, setNewMemberPass] = useState('');
  const [newMemberLimit, setNewMemberLimit] = useState('');
  
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('فواتير');
  const [expenseMember, setExpenseMember] = useState('');

  const [toBuyItem, setToBuyItem] = useState('');
  const [toAvoidItem, setToAvoidItem] = useState('');
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;

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
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (loginUser === 'anas' && loginPass === 'anas123') {
      setCurrentUser('أنس');
      setIsAdmin(true);
      setIsAuthenticated(true);
      setExpenseMember('أنس');
      return;
    }

    try {
      const querySnapshot = await getDocs(collection(db, 'members'));
      let found = false;
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.username === loginUser && data.password === loginPass) {
          found = true;
          if (data.activeSession && data.activeSession !== sessionId) {
            setLoginError('⚠️ هذا الحساب مفتوح حالياً على جهاز آخر! لا يمكن فتحه من جهازين في نفس الوقت.');
            return;
          }
          setCurrentUser(data.name);
          setIsAdmin(false);
          setIsAuthenticated(true);
          setExpenseMember(data.name);
        }
      });

      if (!found && !loginError) {
        setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة.');
      }
    } catch (err) {
      setLoginError('حدث خطأ أثناء تسجيل الدخول. تأكد من الاتصال.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginUser('');
    setLoginPass('');
  };

  const sessionId = Math.random().toString(36).substring(7);

  const totalSpent = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const remainingBudget = totalBudget - totalSpent;

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName || !newMemberUsername || !newMemberPass || !newMemberLimit) return;
    await addDoc(collection(db, 'members'), {
      name: newMemberName,
      username: newMemberUsername,
      password: newMemberPass,
      limit: Number(newMemberLimit),
      role: 'فرد'
    });
    setNewMemberName('');
    setNewMemberUsername('');
    setNewMemberPass('');
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans dir-rtl" dir="rtl">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="bg-emerald-500/20 w-16 h-16 mx-auto flex items-center justify-center rounded-2xl border border-emerald-500/40 text-emerald-400">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">Family - بوابة الدخول الآمن</h1>
            <p className="text-xs text-slate-400">الرجاء إدخال بيانات الحساب الخاصة بك للمتابعة</p>
          </div>

          {loginError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">اسم المستخدم (Username)</label>
              <input
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">كلمة المرور (Password)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm"
            >
              تسجيل الدخول للنظام
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800">
            ملاحظة: الحسابات محمية ولا يمكن فتح نفس الحساب على جهازين في نفس الوقت.
          </div>
        </div>
      </div>
    );
  }

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
              <p className="text-xs text-slate-400">مرحباً بك، {currentUser} {isAdmin && '(مدير النظام)'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-4 h-4" /> خروج
          </button>
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
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm font-medium">إجمالي المصاريف</span>
              <TrendingUp className="w-5 h-5 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-400">{totalSpent.toLocaleString()} ل.س</div>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm font-medium">المبلغ المتبقي</span>
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
            </div>
            <div className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-red-500' : 'text-teal-400'}`}>
              {remainingBudget.toLocaleString()} ل.س
            </div>
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
                <input
                  type="text"
                  value={currentUser}
                  disabled
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-400 cursor-not-allowed text-center"
                />
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
            {isAdmin && (
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-4">
                <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                  <UserPlus className="w-5 h-5" /> إضافة فرد جديد وتحديد بيانات الدخول
                </h3>
                <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  <input
                    type="text"
                    placeholder="اسم الفرد (مثلاً: أحمد)"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="اسم المستخدم (Username)"
                    value={newMemberUsername}
                    onChange={(e) => setNewMemberUsername(e.target.value)}
                    className="bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="كلمة المرور (Password)"
                    value={newMemberPass}
                    onChange={(e) => setNewMemberPass(e.target.value)}
                    className="bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="سقف المصروف (ل.س)"
                    value={newMemberLimit}
                    onChange={(e) => setNewMemberLimit(e.target.value)}
                    className="bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-all shadow-md shadow-emerald-500/20"
                  >
                    حفظ الحساب
                  </button>
                </form>
              </div>
            )}

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
                        <h4 className="font-bold text-slate-100 flex items-center gap-2">
                          {m.name} <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-400 font-mono">User: {m.username}</span>
                        </h4>
                        <span className="text-xs text-slate-400">سقف المصروف: {m.limit.toLocaleString()} ل.س</span>
                      </div>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDeleteMember(m.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
        تطبيق Family - مصمم بأعلى معايير الخصوصية والأمان للعائلة السورية
      </footer>
    </div>
  );
}
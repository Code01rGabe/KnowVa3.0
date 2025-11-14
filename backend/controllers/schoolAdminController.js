const Classroom = require('../models/Classroom');
const Subject = require('../models/Subject');
const LearningMaterial = require('../models/LearningMaterial');
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const User = require('../models/User');
const School = require('../models/School');

const buildPagination = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// Ensure user belongs to a school
const ensureSchool = (req, res) => {
  const schoolId = req.user.schoolId;
  if (!schoolId) {
    res.status(400).json({ message: 'No school assigned to this account' });
    return null;
  }
  return schoolId;
};

// ---------- CLASSROOMS ----------

const listClassrooms = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  const { search = '' } = req.query;
  const { page, limit, skip } = buildPagination(req);

  const filter = { schoolId };
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  try {
    const [classrooms, total] = await Promise.all([
      Classroom.find(filter)
        .populate('teachers', 'profile.name email')
        .populate('students', 'profile.name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Classroom.countDocuments(filter),
    ]);

    res.json({
      data: classrooms,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('School admin list classrooms error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createClassroom = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  try {
    const classroom = await Classroom.create({
      ...req.body,
      schoolId,
    });
    res.status(201).json({ message: 'Classroom created', classroom });
  } catch (error) {
    console.error('School admin create classroom error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateClassroom = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  try {
    const classroom = await Classroom.findOneAndUpdate(
      { _id: req.params.classroomId, schoolId },
      req.body,
      { new: true }
    );
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    res.json({ message: 'Classroom updated', classroom });
  } catch (error) {
    console.error('School admin update classroom error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteClassroom = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  try {
    const classroom = await Classroom.findOneAndDelete({
      _id: req.params.classroomId,
      schoolId,
    });
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    res.json({ message: 'Classroom deleted' });
  } catch (error) {
    console.error('School admin delete classroom error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const enrollStudent = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  const { studentId } = req.body;
  if (!studentId) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  try {
    const classroom = await Classroom.findOne({ _id: req.params.classroomId, schoolId });
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Check if student is already enrolled
    const studentExists = classroom.students.some(
      (id) => id.toString() === studentId.toString()
    );

    if (!studentExists) {
      classroom.students.push(studentId);
      await classroom.save();
      
      // Reload to get populated data
      const updatedClassroom = await Classroom.findById(classroom._id)
        .populate('teachers', 'profile.name email')
        .populate('students', 'profile.name email');
      
      return res.json({ message: 'Student enrolled successfully', classroom: updatedClassroom });
    } else {
      return res.status(400).json({ message: 'Student is already enrolled in this classroom' });
    }
  } catch (error) {
    console.error('School admin enroll student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const removeStudent = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  const { studentId } = req.body;
  try {
    const classroom = await Classroom.findOne({ _id: req.params.classroomId, schoolId });
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    classroom.students = classroom.students.filter((id) => id.toString() !== studentId);
    await classroom.save();

    res.json({ message: 'Student removed', classroom });
  } catch (error) {
    console.error('School admin remove student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addTeacher = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  const { teacherId } = req.body;
  if (!teacherId) {
    return res.status(400).json({ message: 'Teacher ID is required' });
  }

  try {
    const classroom = await Classroom.findOne({ _id: req.params.classroomId, schoolId });
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Check if teacher is already in the classroom
    const teacherExists = classroom.teachers.some(
      (id) => id.toString() === teacherId.toString()
    );

    if (!teacherExists) {
      classroom.teachers.push(teacherId);
      await classroom.save();
      
      // Reload to get populated data
      const updatedClassroom = await Classroom.findById(classroom._id)
        .populate('teachers', 'profile.name email')
        .populate('students', 'profile.name email');
      
      return res.json({ message: 'Teacher added successfully', classroom: updatedClassroom });
    } else {
      return res.status(400).json({ message: 'Teacher is already assigned to this classroom' });
    }
  } catch (error) {
    console.error('School admin add teacher error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const removeTeacher = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  const { teacherId } = req.body;
  try {
    const classroom = await Classroom.findOne({ _id: req.params.classroomId, schoolId });
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    classroom.teachers = classroom.teachers.filter((id) => id.toString() !== teacherId);
    await classroom.save();

    res.json({ message: 'Teacher removed', classroom });
  } catch (error) {
    console.error('School admin remove teacher error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ---------- SUBJECTS ----------

const listSubjects = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  const filter = { schoolId };
  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: 'i' };
  }

  try {
    const subjects = await Subject.find(filter).sort({ createdAt: -1 });
    res.json({ data: subjects });
  } catch (error) {
    console.error('School admin list subjects error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createSubject = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  try {
    const subject = await Subject.create({ ...req.body, schoolId });
    res.status(201).json({ message: 'Subject created', subject });
  } catch (error) {
    console.error('School admin create subject error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateSubject = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.subjectId, schoolId },
      req.body,
      { new: true }
    );
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json({ message: 'Subject updated', subject });
  } catch (error) {
    console.error('School admin update subject error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const toggleSubject = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  try {
    const subject = await Subject.findOne({ _id: req.params.subjectId, schoolId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    subject.active = !subject.active;
    await subject.save();
    res.json({ message: 'Subject status updated', subject });
  } catch (error) {
    console.error('School admin toggle subject error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ---------- LEARNING MATERIALS ----------

const listMaterials = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  const filter = { schoolId };
  if (req.query.status) {
    filter.status = req.query.status;
  }

  try {
    const materials = await LearningMaterial.find(filter)
      .populate('subjectId', 'name')
      .populate('uploadedBy', 'profile.name email')
      .sort({ createdAt: -1 });
    res.json({ data: materials });
  } catch (error) {
    console.error('School admin list materials error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateMaterialStatus = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  const { status } = req.body;
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const material = await LearningMaterial.findOneAndUpdate(
      { _id: req.params.materialId, schoolId },
      { status },
      { new: true }
    );
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.json({ message: `Material ${status}`, material });
  } catch (error) {
    console.error('School admin update material status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ---------- ATTENDANCE ----------

const recordAttendance = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  try {
    const records = await Promise.all(
      req.body.records.map((record) =>
        Attendance.findOneAndUpdate(
          { schoolId, studentId: record.studentId, date: record.date },
          {
            schoolId,
            classroomId: record.classroomId || null,
            studentId: record.studentId,
            date: record.date,
            status: record.status,
            recordedBy: req.user.userId,
            notes: record.notes || '',
          },
          { new: true, upsert: true }
        )
      )
    );
    res.json({ message: 'Attendance recorded', records });
  } catch (error) {
    console.error('School admin record attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const listAttendance = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  const filter = { schoolId };
  if (req.query.studentId) filter.studentId = req.query.studentId;
  if (req.query.classroomId) filter.classroomId = req.query.classroomId;
  if (req.query.from && req.query.to) {
    filter.date = {
      $gte: new Date(req.query.from),
      $lte: new Date(req.query.to),
    };
  }

  try {
    const records = await Attendance.find(filter)
      .populate('studentId', 'profile.name')
      .populate('classroomId', 'name')
      .sort({ date: -1 });
    res.json({ data: records });
  } catch (error) {
    console.error('School admin list attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ---------- ANALYTICS ----------

const getSchoolAnalytics = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  try {
    const [teacherCount, studentCount, courses, attendanceRecords, submissions] = await Promise.all([
      User.countDocuments({ schoolId, role: 'teacher' }),
      User.countDocuments({ schoolId, role: 'student' }),
      Course.find({ schoolId }),
      Attendance.find({ schoolId }).sort({ date: -1 }).limit(500),
      Submission.find({ schoolId }).sort({ updatedAt: -1 }).limit(500),
    ]);

    const courseIds = courses.map((course) => course._id);
    const assignmentCount = courseIds.length
      ? await Assignment.countDocuments({ courseId: { $in: courseIds } })
      : 0;

    const pendingSubmissions = submissions.filter((submission) => submission.status === 'pending').length;

    res.json({
      stats: {
        teachers: teacherCount,
        students: studentCount,
        courses: courses.length,
        assignments: assignmentCount,
        pendingSubmissions,
        totalEnrollments: courses.reduce(
          (sum, course) => sum + (course.enrolledStudents?.length || 0),
          0
        ),
      },
      attendance: attendanceRecords,
      submissions,
    });
  } catch (error) {
    console.error('School admin analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ---------- SCHOOL SETTINGS ----------

const getSchoolSettings = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  try {
    const school = await School.findById(schoolId).select('branding gradingSystem timetable subscription metadata');
    res.json({ settings: school });
  } catch (error) {
    console.error('School admin get settings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateSchoolSettings = async (req, res) => {
  const schoolId = ensureSchool(req, res);
  if (!schoolId) return;

  try {
    const school = await School.findByIdAndUpdate(
      schoolId,
      { ...req.body },
      { new: true }
    ).select('branding gradingSystem timetable subscription metadata');
    res.json({ message: 'Settings updated', settings: school });
  } catch (error) {
    console.error('School admin update settings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  listClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  enrollStudent,
  removeStudent,
  addTeacher,
  removeTeacher,
  listSubjects,
  createSubject,
  updateSubject,
  toggleSubject,
  listMaterials,
  updateMaterialStatus,
  recordAttendance,
  listAttendance,
  getSchoolAnalytics,
  getSchoolSettings,
  updateSchoolSettings,
};


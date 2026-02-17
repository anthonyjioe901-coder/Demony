package com.demony.invest.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.demony.invest.data.models.Project
import com.demony.invest.data.models.ProjectsResponse
import com.demony.invest.data.repository.DemonyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Projects ViewModel
 * 
 * Handles project listing and details
 */
@HiltViewModel
class ProjectsViewModel @Inject constructor(
    private val repository: DemonyRepository
) : ViewModel() {

    private val _projects = MutableStateFlow<List<Project>>(emptyList())
    val projects: StateFlow<List<Project>> = _projects.asStateFlow()

    private val _featuredProjects = MutableStateFlow<List<Project>>(emptyList())
    val featuredProjects: StateFlow<List<Project>> = _featuredProjects.asStateFlow()

    private val _selectedProject = MutableStateFlow<Project?>(null)
    val selectedProject: StateFlow<Project?> = _selectedProject.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _isLoadingMore = MutableStateFlow(false)
    val isLoadingMore: StateFlow<Boolean> = _isLoadingMore.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _selectedCategory = MutableStateFlow<String?>(null)
    val selectedCategory: StateFlow<String?> = _selectedCategory.asStateFlow()

    private val _categories = MutableStateFlow<List<String>>(emptyList())
    val categories: StateFlow<List<String>> = _categories.asStateFlow()

    private val _totalProjects = MutableStateFlow(0)
    val totalProjects: StateFlow<Int> = _totalProjects.asStateFlow()

    private val _roiResult = MutableStateFlow<Map<String, Any>?>(null)
    val roiResult: StateFlow<Map<String, Any>?> = _roiResult.asStateFlow()

    private val _isRoiLoading = MutableStateFlow(false)
    val isRoiLoading: StateFlow<Boolean> = _isRoiLoading.asStateFlow()

    private val _roiError = MutableStateFlow<String?>(null)
    val roiError: StateFlow<String?> = _roiError.asStateFlow()

    private var currentPage = 1
    private var totalPages = 1
    private var hasMorePages = true

    init {
        loadProjects()
        loadFeaturedProjects()
    }

    fun loadProjects(forceRefresh: Boolean = false) {
        if (forceRefresh) {
            currentPage = 1
            hasMorePages = true
            _projects.value = emptyList()
        }

        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            val category = _selectedCategory.value
            
            repository.getProjects(
                page = currentPage,
                limit = 20,
                category = category
            )
                .onSuccess { response ->
                    _projects.value = response.projects
                    if (response.categories.isNotEmpty()) {
                        _categories.value = response.categories
                    } else if (_categories.value.isEmpty()) {
                        _categories.value = response.projects.map { it.category }.distinct().sorted()
                    }
                    response.pagination?.let { pagination ->
                        totalPages = pagination.pages
                        hasMorePages = currentPage < totalPages
                        _totalProjects.value = pagination.total
                    }
                }
                .onFailure { exception ->
                    _error.value = exception.message ?: "Failed to load projects"
                }

            _isLoading.value = false
        }
    }

    fun loadMoreProjects() {
        if (!hasMorePages || _isLoadingMore.value) return

        viewModelScope.launch {
            _isLoadingMore.value = true
            currentPage++

            val category = _selectedCategory.value
            
            repository.getProjects(
                page = currentPage,
                limit = 10,
                category = category
            )
                .onSuccess { response ->
                    _projects.value = _projects.value + response.projects
                    response.pagination?.let { pagination ->
                        totalPages = pagination.pages
                        hasMorePages = currentPage < totalPages
                    }
                }
                .onFailure {
                    currentPage-- // Revert on failure
                }

            _isLoadingMore.value = false
        }
    }

    fun loadFeaturedProjects() {
        viewModelScope.launch {
            repository.getProjects(page = 1, limit = 5, sort = "most-funded")
                .onSuccess { response ->
                    _featuredProjects.value = response.projects.take(3)
                }
        }
    }

    fun selectCategory(category: String) {
        _selectedCategory.value = category
        loadProjects(forceRefresh = true)
    }

    fun selectAllCategories() {
        _selectedCategory.value = null
        loadProjects(forceRefresh = true)
    }

    fun getProject(projectId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            repository.getProject(projectId)
                .onSuccess { project ->
                    _selectedProject.value = project
                }
                .onFailure { exception ->
                    _error.value = exception.message ?: "Failed to load project"
                }

            _isLoading.value = false
        }
    }

    fun clearSelectedProject() {
        _selectedProject.value = null
    }

    fun calculateReturns(projectId: String, amount: Double, durationMonths: Int = 12) {
        viewModelScope.launch {
            _isRoiLoading.value = true
            _roiError.value = null
            _roiResult.value = null

            repository.calculateReturns(projectId, amount, durationMonths)
                .onSuccess { result ->
                    _roiResult.value = result
                }
                .onFailure { exception ->
                    _roiError.value = exception.message ?: "Failed to calculate returns"
                }

            _isRoiLoading.value = false
        }
    }

    fun clearRoiState() {
        _roiResult.value = null
        _roiError.value = null
    }

    fun clearError() {
        _error.value = null
    }

    fun refresh() {
        loadProjects(forceRefresh = true)
        loadFeaturedProjects()
    }
}

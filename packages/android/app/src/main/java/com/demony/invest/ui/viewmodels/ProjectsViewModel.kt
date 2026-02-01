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

    private val _searchQuery = MutableStateFlow<String?>(null)
    val searchQuery: StateFlow<String?> = _searchQuery.asStateFlow()

    private val _sortOrder = MutableStateFlow("newest")
    val sortOrder: StateFlow<String> = _sortOrder.asStateFlow()

    private var currentPage = 1
    private var totalPages = 1
    private var hasMorePages = true

    val categories = listOf(
        "All",
        "Agriculture",
        "Technology",
        "Real Estate",
        "Manufacturing",
        "Retail",
        "Healthcare",
        "Energy",
        "Education",
        "Transportation"
    )

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

            val category = _selectedCategory.value?.takeIf { it != "All" }
            val search = _searchQuery.value
            val sort = _sortOrder.value
            
            repository.getProjects(
                page = currentPage,
                limit = 10,
                category = category,
                sort = sort,
                search = search
            )
                .onSuccess { response ->
                    _projects.value = response.projects
                    response.pagination?.let { pagination ->
                        totalPages = pagination.pages
                        hasMorePages = currentPage < totalPages
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

            val category = _selectedCategory.value?.takeIf { it != "All" }
            val search = _searchQuery.value
            val sort = _sortOrder.value
            
            repository.getProjects(
                page = currentPage,
                limit = 10,
                category = category,
                sort = sort,
                search = search
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

    fun searchProjects(query: String) {
        _searchQuery.value = query.takeIf { it.isNotBlank() }
        loadProjects(forceRefresh = true)
    }

    fun clearSearch() {
        _searchQuery.value = null
        loadProjects(forceRefresh = true)
    }

    fun setSortOrder(sort: String) {
        _sortOrder.value = sort
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

    fun clearError() {
        _error.value = null
    }

    fun refresh() {
        loadProjects(forceRefresh = true)
        loadFeaturedProjects()
    }
}
